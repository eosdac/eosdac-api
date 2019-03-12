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


        this.payers = {}

        // setInterval(() => {console.log(this.payers)}, 5000)

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


    async processDeltaJob(job, done) {
        console.log(`Processing job : `, job)
        const deltas = job.data.deltas;
        const abi = job.data.abi;
        const block_num = job.data.block_num;
        // console.log(job.data)

        try {
            // console.log(abi)
            const types = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), abi);
            for (const table of abi.tables)
                this.tables.set(table.name, table.type);
            await this.processDelta(block_num, deltas, types);

            done()
        } catch (e) {
            done(e)
        }
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
                                console.log('Queue delta row')
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

    async processDelta(block_num, deltas, types) {
        for (const delta of deltas) {
            // console.log(delta)
            switch (delta[0]) {
                case 'table_delta_v0':
                    if (delta[1].name == 'contract_row') {
                        for (const row of delta[1].rows) {
                            // console.log(row)
                            const type = types.get(delta[1].name);
                            const sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: new Uint8Array(Object.values(row.data))
                            });


                            let row_version, code, scope ,table, primary_key, payer, data_raw;
                            try {
                                row_version = sb.get(); // ?
                                code = sb.getName();

                                // console.log(`code ${code}`)
                                // console.log(`table ${table}`)
                            }
                            catch (e){
                                console.error(`Error processing row.data for ${block_num} : ${e.message}`);
                                const data_raw = null
                            }


                            if (this.interested(code)) {
                                // console.log(abi)
                                scope = sb.getName();
                                table = sb.getName();
                                primary_key = sb.getUint64AsNumber();
                                payer = sb.getName();
                                data_raw = sb.getBytes()

                                const table_type = await this.getTableType(code, table);
                                if (!table_type){
                                    console.log('Could not find type for ${code}:${table}')
                                    continue
                                }

                                const data_sb = new Serialize.SerialBuffer({
                                    textEncoder: new TextEncoder,
                                    textDecoder: new TextDecoder,
                                    array: data_raw
                                });
                                const data = table_type.deserialize(data_sb);

                                if (code != 'eosio'){
                                    console.log(`row version ${row_version}`);
                                    console.log(`code ${code}`);
                                    console.log(`scope ${scope}`);
                                    console.log(`table ${table}`);
                                    console.log(`primary_key ${primary_key}`);
                                    console.log(`payer ${payer}`);
                                    // console.log(`data`)
                                    console.log(data);

                                    const doc = {
                                        block_num, code, scope, table, primary_key, payer, data, present: row.present
                                    };


                                    const col = this.db.collection('deltas');
                                    col.insertOne(doc)
                                }
                            }

                        }

                    }
                    break;
            }
        }
    }

    interested(account, name) {
        if (this.config.eos.contracts == '*' || this.config.eos.contracts.includes(account)){
            return true
        }

        return false;
    }
}


module.exports = DeltaHandler