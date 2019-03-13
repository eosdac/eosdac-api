const MongoClient = require('mongodb').MongoClient;

const {Api, JsonRpc, Serialize} = require('eosjs');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');

const RabbitSender = require('../rabbitsender')
const Int64 = require('int64-buffer').Int64BE;



class DeltaHandler {
    constructor({queue, config}) {
        this.queue = queue;
        this.config = config;
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
        this.connectAmq()
    }

    async connectDb() {
        this.db = await this._connectDb()
    }

    async connectAmq(){
        this.amq = RabbitSender.init(this.config.amq)
    }

    async _connectDb() {
        if (this.config.mongo){
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(client.db(this.config.mongo.dbName))
                    }
                }).bind(this))
            })
        }
    }

    async getTableType (code, table){
        const contract = await this.api.getContract(code);
        const abi = await this.api.getAbi(code);

        // console.log(abi)

        let this_table, type;
        for (let t of abi.tables) {
            if (t.name == table) {
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


    queueDelta(block_num, deltas, abi) {
        const data = {block_num, deltas, abi};
        // console.log(`Queueing delta `, deltas)
        // this.queue.create('block_deltas', data).removeOnComplete(true).save()

        for (const delta of deltas) {
            // console.log(delta)
            switch (delta[0]) {
                case 'table_delta_v0':
                    if (delta[1].name == 'contract_row') {
                        // continue
                        for (const row of delta[1].rows) {

                            const sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: row.data
                            });


                            let code
                            try {
                                sb.get(); // ?
                                code = sb.getName();
                            }
                            catch (e){
                                console.error(`Error processing row.data for ${block_num} : ${e.message}`);
                                const data_raw = null
                            }

                            if (this.interested(code)) {
                                // console.log('Queue delta row')
                                this.queueDeltaRow('contract_row', block_num, row)
                            }
                        }
                    }
                    break
            }
        }
    }

    async queueDeltaRow(name, block_num, row) {
        return new Promise((resolve, reject) => {
            this.amq.then((amq) => {
                const block_buffer = new Int64(block_num).toBuffer()
                const present_buffer = Buffer.from([row.present])
                // console.log(`Publishing ${name}`)
                amq.send(name, Buffer.concat([block_buffer, present_buffer, Buffer.from(row.data)]))
                    .then(resolve)
                    .catch(reject)
            })
        })

    }

    async processDelta(block_num, deltas, types) {}

    interested(account, name) {
        if (this.config.eos.contracts == '*' || this.config.eos.contracts.includes(account)){
            return true
        }

        return false;
    }
}


module.exports = DeltaHandler