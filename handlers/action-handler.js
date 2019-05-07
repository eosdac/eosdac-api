const MongoClient = require('mongodb').MongoClient;

const {Api, JsonRpc, Serialize} = require('eosjs');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');

const Int64 = require('int64-buffer').Int64BE;
const InterestedContracts = require('../interested-contracts');

const {hexToUint8Array} = require('eosjs/dist/eosjs-serialize');

class ActionHandler {
    constructor({queue, db, config}) {
        this.amq = queue;
        this.config = config;
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
        this.interested_contracts = new InterestedContracts({config: this.config, db:this.db});
        await this.interested_contracts.reload();
    }

    _connectDb() {
        if (this.config.mongo) {
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        const db = client.db(this.config.mongo.dbName);
                        resolve(db);
                    }
                }).bind(this));
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
        // console.log(`Receive queue ${trx_id} for block ${block_num}`)
        // console.log(action)

        if (this.interested(action.act.account, action.act.name) && action.receipt[1].receiver === action.act.account) {
            console.log("Queue Action", action.act.account);
            if (action.act.name == 'setabi'){
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
            // console.log(action.act.account)
            // let data = {
            //     block_num,
            //     trx_id,
            //     action: action.act,
            //     receiver: action.receipt[1].receiver,
            //     receiver_sequence: action.receipt[1].recv_sequence,
            //     global_sequence: action.receipt[1].global_sequence
            // };
            // console.log(data)

            const sb_action = new Serialize.SerialBuffer({
                textEncoder: new TextEncoder,
                textDecoder: new TextDecoder
            });

            const trx_id_arr = hexToUint8Array(trx_id);

            sb_action.pushName(action.act.account);
            sb_action.pushName(action.act.name);
            sb_action.pushBytes(action.act.data);

            if (this.amq) {
                // console.log(`Queueing action for ${action.act.account}::${action.act.name}`);
                this.amq.then((amq) => {
                    const block_buffer = new Int64(block_num).toBuffer();
                    const timestamp_buffer = this.int32ToBuffer(block_timestamp.getTime() / 1000);
                    const trx_id_buffer = Buffer.from(trx_id_arr);
                    const recv_buffer = new Int64(action.receipt[1].recv_sequence).toBuffer();
                    const global_buffer = new Int64(action.receipt[1].global_sequence).toBuffer();
                    const action_buffer = Buffer.from(sb_action.array);
                    // console.log(`Publishing action`)
                    amq.send('action', Buffer.concat([block_buffer, timestamp_buffer, trx_id_buffer, recv_buffer, global_buffer, action_buffer]))
                })
            } else {
                console.error(`No queue when processing action for ${action.act.account}::${action.act.name} in ${trx_id}`);
            }
        }


        if (action.inline_traces.length) {
            for (let itc of action.inline_traces) {
                // console.log("inline trace\n", itc);
                if (itc[0] === 'action_trace_v0') {
                    this.queueAction(block_num, itc[1], trx_id, block_timestamp);
                }
            }
        }
    }

    interested(account, name) {
        if (name === 'onblock') {
            return false
        }
        const is_setabi = (account == 'eosio' && name == 'setabi');

        return (is_setabi || this.interested_contracts.has(account));
    }
}

module.exports = ActionHandler;

