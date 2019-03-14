#!/usr/bin/env node

const commander = require('commander');

const cluster = require('cluster')

const { TextDecoder, TextEncoder } = require('text-encoding');
const {Api, JsonRpc, Serialize} = require('eosjs');
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const MongoLong = require('mongodb').Long;
const {ActionHandler, TraceHandler, DeltaHandler} = require('./eosdac-handlers')
const RabbitSender = require('./rabbitsender')
const Int64 = require('int64-buffer').Int64BE;
const crypto = require('crypto')


class JobProcessor {
    constructor({ config = 'jungle' }) {
        this.config = require(`./${config}.config`)

        this.connectAmq()
        this.connectDb()

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
    }


    async connectDb() {
        this.db = this._connectDb()
    }

    async _connectDb() {
        if (this.config.mongo){
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        console.log(`Connected to ${this.config.mongo.url}/${this.config.mongo.dbName}`)
                        resolve(client.db(this.config.mongo.dbName))
                    }
                }).bind(this))
            })
        }
    }

    async connectAmq(){
        this.amq = RabbitSender.init(this.config.amq)

        // this.action_handler = new ActionHandler({queue:this.amq, config:this.config})
        // this.block_handler = new TraceHandler({queue:this.amq, action_handler:this.action_handler, config:this.config})
        this.delta_handler = new DeltaHandler({queue:this.amq, config:this.config})
    }

    async processActionJob(job){
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });

        const block_num = new Int64(sb.getUint8Array(8)).toString()
        const recv_sequence = new Int64(sb.getUint8Array(8)).toString()
        const global_sequence = new Int64(sb.getUint8Array(8)).toString()
        const account = sb.getName()
        const name = sb.getName()
        const data = sb.getBytes()

        console.log('Process action', block_num, account, name, recv_sequence, global_sequence)

        const action = {account, name, data}

        console.log(`Deserializing action ${account}:${name}`)

        let act
        try {
            act = await this.api.deserializeActions([action]);
        }
        catch(e) {
            console.error(`Error deserializing action data ${account}:${name} - ${e.message}`)
            return
        }



        delete act[0].authorization

        const doc = {
            block_num: MongoLong.fromString(block_num),
            action: act[0],
            recv_sequence: MongoLong.fromString(recv_sequence),
            global_sequence: MongoLong.fromString(global_sequence)
        }

        console.log(doc)

        this.db.then((db) => {
            const col = db.collection('actions')
            col.insertOne(doc).then((d) => {
                console.log('Save completed')

                this.amq.then((amq) => {
                    amq.ack(job)
                })
            }).catch((e) => {
                if (e.code == 11000){ // Duplicate index
                    this.amq.then((amq) => {
                        amq.ack(job)
                    })
                }
                else {
                    console.error('DB save failed :(', e)

                    this.amq.then((amq) => {
                        amq.reject(job)
                    })
                }
            })
        })
    }

    async processContractRow(job){
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });


        const block_num = new Int64(sb.getUint8Array(8)).toString()
        const present = sb.get()
        const row_version = sb.get() // ?
        const code = sb.getName()
        const scope = sb.getName()
        const table = sb.getName()
        const primary_key = new Int64(sb.getUint8Array(8)).toString()
        const payer = sb.getName()
        const data_raw = sb.getBytes()

        const table_type = await this.delta_handler.getTableType(code, table);
        const data_sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: data_raw
        });
        try {
            const data = table_type.deserialize(data_sb);

            if (code != 'eosio'){
                // console.log(`row version ${row_version}`);
                // console.log(`code ${code}`);
                // console.log(`scope ${scope}`);
                // console.log(`table ${table}`);
                // console.log(`primary_key ${primary_key}`);
                // console.log(`payer ${payer}`);
                // // console.log(`data`)
                // console.log(data);

                console.log(`Storing ${code}:${table}`)

                const data_hash = crypto.createHash('sha1').update(data_raw).digest('hex')

                const doc = {
                    block_num: MongoLong.fromString(block_num),
                    code,
                    scope,
                    table,
                    primary_key: MongoLong.fromString(primary_key),
                    payer,
                    data,
                    data_hash,
                    present
                };

                console.log(doc)

                this.db.then((db) => {
                    const col = db.collection('contract_rows')
                    col.insertOne(doc).then(() => {
                        console.log('Save completed')

                        this.amq.then((amq) => {
                            amq.ack(job)
                        })
                    }).catch((e) => {
                        this.amq.then((amq) => {
                            if (e.code == 11000){
                                // duplicate index
                                amq.ack(job)
                            }
                            else {
                                console.error('DB save failed :(', e)
                                amq.reject(job)
                            }
                        })
                    })
                })

            }
        }
        catch (e){
            console.error(`Error deserializing ${code}:${table} : ${e.message}`)
            this.amq.then((amq) => {
                amq.ack(job)
            })
            return
        }


    }


    async start(){
        this.contracts = this.config.eos.contracts;


        if (cluster.isMaster) {
            console.log(`Starting processor with ${this.config.clusterSize} threads...`)
            // kue.app.listen(3001)

            for (let i = 0; i < this.config.clusterSize; i++) {
                cluster.fork()
            }
        } else {
            const self = this
            this.amq.then((amq) => {
                amq.listen('contract_row', self.processContractRow.bind(self))
                amq.listen('action', self.processActionJob.bind(self))
            })
        }
    }

    interested(account) {
        return (this.config.eos.contracts == '*' || this.config.eos.contracts.includes(account))
    }
}


commander
    .version('0.1', '-v, --version')
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .parse(process.argv);

const processor = new JobProcessor(commander);
processor.start()