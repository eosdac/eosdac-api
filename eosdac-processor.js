#!/usr/bin/env node

const fs = require('fs')
const commander = require('commander');

const kue = require('kue')
const cluster = require('cluster')

const { TextDecoder, TextEncoder } = require('text-encoding');
const {Api, JsonRpc, Serialize} = require('eosjs');
const MongoClient = require('mongodb').MongoClient;
const {ActionHandler, TraceHandler, DeltaHandler} = require('./eosdac-handlers')
const RabbitSender = require('./rabbitsender')
const Int64 = require('int64-buffer').Int64BE;

// var access = fs.createWriteStream('consumers.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)


class JobProcessor {
    constructor({ config = 'jungle' }) {
        this.config = require(`./${config}.config`)


        // this.queue = kue.createQueue({
        //     prefix: this.config.redisPrefix,
        //     redis: this.config.redis
        // })

        this.connectAmq()
        this.connectDb()
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

    async processContractRow(job){
        console.log(`Process row`)

        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });


        const block_num = new Int64(sb.getUint8Array(8)).toString()
        const present = sb.get()
        const row_version = sb.get(); // ?
        const code = sb.getName();
        const scope = sb.getName();
        const table = sb.getName();
        const primary_key = sb.getUint64AsNumber();
        const payer = sb.getName();
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
                console.log(`row version ${row_version}`);
                console.log(`code ${code}`);
                console.log(`scope ${scope}`);
                console.log(`table ${table}`);
                console.log(`primary_key ${primary_key}`);
                console.log(`payer ${payer}`);
                // console.log(`data`)
                console.log(data);

                const doc = {
                    block_num, code, scope, table, primary_key, payer, data, present
                };

                console.log(doc)

                this.db.then((db) => {
                    const col = db.collection('deltas')
                    col.insertOne(doc)
                })

                this.amq.then((amq) => {
                    amq.ack(job)
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
            this.amq.then((amq) => {
                amq.listen('contract_row', this.processContractRow.bind(this))
            })


            // if (this.config.mongo){
            //     MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
            //         if (err){
            //             console.error("\nFailed to connect\n", err)
            //         }
            //         else if (client){
            //             this.db = client.db(this.config.mongo.dbName);
            //         }
            //
            //         // this.queue.process('block_traces', 1, this.block_handler.processTraceJob.bind(this.block_handler))
            //         // this.queue.process('action', 1, this.action_handler.processActionJob.bind(this.action_handler))
            //         this.queue.process('block_deltas', 1, this.delta_handler.processDeltaJob.bind(this.delta_handler))
            //
            //     }).bind(this));
            // }
            // else {
            //     // this.queue.process('block_traces', 1, this.block_handler.processTraceJob.bind(this.block_handler))
            //     // this.queue.process('action', 1, this.action_handler.processActionJob.bind(this.action_handler))
            //     this.queue.process('block_deltas', 1, this.delta_handler.processDeltaJob.bind(this.delta_handler))
            // }

        }
    }

    interested(account) {
        return this.config.eos.contracts.includes(account)
    }
}


commander
    .version('0.1', '-v, --version')
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .parse(process.argv);

const processor = new JobProcessor(commander);
processor.start()