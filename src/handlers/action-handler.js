const MongoClient = require('mongodb').MongoClient;

const {Api, JsonRpc, Serialize} = require('@jafri/eosjs2');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');

const Int64 = require('int64-buffer').Int64BE;

const {hexToUint8Array} = require('@jafri/eosjs2/dist/eosjs-serialize');

class ActionHandler {
    constructor({queue, db, config, dac_directory, logger}) {
        this.amq = queue;
        this.config = config;
        this.dac_directory = dac_directory;
        this.logger = logger;
        this.connectDb();

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        // this.parseInterestedConfig()
    }

    async connectDb() {
        this.db = await this._connectDb();
    }

    _connectDb() {
        if (this.config.mongo) {
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, (err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        const db = client.db(this.config.mongo.dbName);
                        resolve(db);
                    }
                });
            })
        }
    }

    int32ToBuffer (num) {
        const arr = Buffer.alloc(4);
        arr.writeUInt32BE(num, 0);
        return arr;
    }

    async processAction(block_num, action, trx_id, block_timestamp) {
        return this.queueAction(block_num, action, trx_id, block_timestamp)
    }

    async queueAction(block_num, action, trx_id, block_timestamp) {
        // this.logger.info(`Receive queue ${trx_id} for block ${block_num}`)
        // this.logger.info(action)

        // console.log(action.receipt);
        const isInterestedAction = (this.interested(action.act.account, action.act.name) && action.receipt && action.receipt[1].receiver === action.act.account);
        const isInterestedTransfer = (action.receipt && this.interested(action.receipt[1].receiver) && action.receipt[1].receiver === action.act.account);

        // console.log(`Checking ${action.act.account}:${action.act.name} ${isInterestedAction || isInterestedTransfer}`);

        if (isInterestedAction || isInterestedTransfer) {
            this.logger.info(`Queue Action ${action.act.account}:${action.act.name}`, action);

            if (action.act.name === 'setabi'){
                const sb_abi = new Serialize.SerialBuffer({
                    textEncoder: new TextEncoder,
                    textDecoder: new TextDecoder,
                    array: action.act.data
                });

                const act_name = sb_abi.getName();

                if (!this.interested(act_name, '')){
                    return;
                }

            }
            // this.logger.info(action.act.account)
            // let data = {
            //     block_num,
            //     trx_id,
            //     action: action.act,
            //     receiver: action.receipt[1].receiver,
            //     receiver_sequence: action.receipt[1].recv_sequence,
            //     global_sequence: action.receipt[1].global_sequence
            // };
            // this.logger.info(data)

            const sb_action = new Serialize.SerialBuffer({
                textEncoder: new TextEncoder,
                textDecoder: new TextDecoder
            });

            const trx_id_arr = hexToUint8Array(trx_id);

            sb_action.pushName(action.act.account);
            sb_action.pushName(action.act.name);
            sb_action.pushBytes(action.act.data);

            if (this.amq) {
                // this.logger.info(`Queueing action for ${action.act.account}::${action.act.name}`);
                const block_buffer = new Int64(block_num).toBuffer();
                const timestamp_buffer = this.int32ToBuffer(block_timestamp.getTime() / 1000);
                const trx_id_buffer = Buffer.from(trx_id_arr);
                const recv_buffer = new Int64(action.receipt[1].recv_sequence).toBuffer();
                const global_buffer = new Int64(action.receipt[1].global_sequence).toBuffer();
                const action_buffer = Buffer.from(sb_action.array);
                // this.logger.info(`Publishing action`)
                this.amq.send('action', Buffer.concat([block_buffer, timestamp_buffer, trx_id_buffer, recv_buffer, global_buffer, action_buffer]))
            } else {
                console.error(`No queue when processing action for ${action.act.account}::${action.act.name} in ${trx_id}`, {action});
            }
        }


        if (action.inline_traces && action.inline_traces.length) {
            for (let itc of action.inline_traces) {
                // this.logger.info("inline trace\n", itc);
                if (itc[0] === 'action_trace_v0') {
                    this.queueAction(block_num, itc[1], trx_id, block_timestamp);
                }
            }
        }
    }

    interested(account, name) {
        if (name === 'onblock') {
            return false;
        }

        if (account === 'eosio' && name === 'setabi'){
            return true;
        }

        if (account === this.config.eos.msigContract){
            return true;
        }
        
        if (account === this.config.eos.custodianContract && name === 'flagcandprof'){
            return true;
        }

        if (account === this.config.eos.dacDirectoryContract) {
            return true;
        }

        return this.dac_directory.has(account);
    }
}

module.exports = ActionHandler;

