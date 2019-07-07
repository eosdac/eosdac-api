const MongoClient = require('mongodb').MongoClient;

const {Api, JsonRpc, Serialize} = require('eosjs');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');

const RabbitSender = require('../rabbitsender');
const Int64 = require('int64-buffer').Int64BE;


class DeltaHandler {
    constructor({queue, config, dac_directory}) {
        this.queue = queue;
        this.config = config;
        this.dac_directory = dac_directory;
        this.tables = new Map;

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        this.connectDb();
        this.connectAmq();

    }

    async connectDb() {
        this.db = await this._connectDb();
    }

    async connectAmq() {
        this.amq = RabbitSender.init(this.config.amq)
    }

    async _connectDb() {
        if (this.config.mongo) {
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, (err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(client.db(this.config.mongo.dbName))
                    }
                })
            })
        }
    }

    async getTableType(code, table) {
        const contract = await this.api.getContract(code);
        const abi = await this.api.getAbi(code);

        // console.log(abi)

        let this_table, type;
        for (let t of abi.tables) {
            if (t.name === table) {
                this_table = t;
                break
            }
        }

        if (this_table) {
            type = this_table.type
        } else {
            console.error(`Could not find table "${table}" in the abi`);
            return
        }

        return contract.types.get(type)
    }


    async queueDelta(block_num, deltas, types, block_timestamp) {
        // const data = {block_num, deltas, abi};
        // this.queue.create('block_deltas', data).removeOnComplete(true).save()

        // console.log(`Queue delta for ${block_num}`);

        for (const delta of deltas) {
            // console.log(delta)
            switch (delta[0]) {
                case 'table_delta_v0':
                    if (delta[1].name === 'contract_row') {
                        // continue
                        for (const row of delta[1].rows) {

                            const sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: row.data
                            });


                            let code;
                            try {
                                // console.log(`row`, row);
                                sb.get(); // ?
                                code = sb.getName();

                                if (code === this.config.eos.dacDirectoryContract){
                                    console.log(`Found dac directory delta change`);

                                    const scope = sb.getName();
                                    const table = sb.getName();

                                    if (scope === this.config.eos.dacDirectoryContract && table === 'dacs'){
                                        this.dac_directory.reload();
                                    }
                                }
                                else if (this.interested(code)) {
                                    // console.log('Queue delta row')
                                    console.log(`Queueing delta ${code}`);
                                    await this.queueDeltaRow('contract_row', block_num, row, block_timestamp);
                                } else {
                                    const scope = sb.getName();
                                    const table = sb.getName();

                                    const msig_contract = this.config.eos.msigContract || 'eosio.msig';

                                    if (table === 'accounts' && this.interested(scope)) {
                                        console.log(`Found interesting token balance change ${code}:${scope}:${table}`);

                                        await this.queueDeltaRow('contract_row', block_num, row, block_timestamp);
                                    }
                                    else if (code === msig_contract && ['proposal', 'approvals', 'approvals2'].includes(table)){
                                        console.log(`Queueing msig ${code}:${scope}:${table}`);

                                        await this.queueDeltaRow('contract_row', block_num, row, block_timestamp);
                                    }
                                }
                            } catch (e) {
                                console.error(`Error processing row.data for ${block_num} : ${e.message}`, e);
                            }
                        }
                    }
                    else if (delta[1].name === 'generated_transaction') {
                        // console.log(`Found generated transaction`);
                        for (const row of delta[1].rows) {
                            const type = types.get(delta[1].name);
                            const data_sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: row.data
                            });
                            const data = type.deserialize(data_sb, new Serialize.SerializerState({ bytesAsUint8Array: true }));
                            if (data[1].sender === this.config.eos.msigContract){
                                // Deferred transaction from msig execute, check if it is one of ours

                                const packed = new Uint8Array(Object.values(data[1].packed_trx));
                                const type_trx = types.get('transaction');
                                const sb_trx = new Serialize.SerialBuffer({
                                    textEncoder: new TextEncoder,
                                    textDecoder: new TextDecoder,
                                    array: packed
                                });
                                const data_trx = type_trx.deserialize(sb_trx, new Serialize.SerializerState({ bytesAsUint8Array: true }));

                                action_loop:
                                for (let a=0;a<data_trx.actions.length;a++){
                                    const act = data_trx.actions[a];
                                    for (let z=0;z<act.authorization.length;z++){
                                        const auth = act.authorization[z];
                                        if (this.interested(auth.actor)){
                                            console.log(`Queuing deferred transaction from msig (actor : ${auth.actor})`);
                                            await this.queueDeltaRow('generated_transaction', block_num, row, block_timestamp);
                                            break action_loop;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break
            }
        }
    }

    int32ToBuffer (num) {
        const arr = Buffer.alloc(4);
        arr.writeUInt32BE(num, 0);
        return arr;
    }

    async queueDeltaRow(name, block_num, row, block_timestamp) {
        return new Promise((resolve, reject) => {
            this.amq.then((amq) => {
                const ts = Math.floor(block_timestamp.getTime() / 1000);
                // console.log('ts', ts);
                const timestamp_buffer = this.int32ToBuffer(ts);
                const block_buffer = new Int64(block_num).toBuffer();
                const present_buffer = Buffer.from([row.present]);
                // console.log(`Publishing ${name}`)
                amq.send(name, Buffer.concat([block_buffer, present_buffer, timestamp_buffer, Buffer.from(row.data)]))
                    .then(resolve)
                    .catch(reject)
            })
        })

    }

    async processDelta(block_num, deltas, abi, block_timestamp) {
        return this.queueDelta(block_num, deltas, abi, block_timestamp)
    }


    interested(account) {
        return this.dac_directory.has(account);
    }
}


module.exports = DeltaHandler;