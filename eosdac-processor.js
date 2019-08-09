#!/usr/bin/env node

process.title = 'eosdac-processor';

const cluster = require('cluster');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc, Serialize} = require('eosjs');
const {DeltaHandler} = require('./handlers');
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const MongoLong = require('mongodb').Long;
const RabbitSender = require('./rabbitsender');
const Int64 = require('int64-buffer').Int64BE;
const crypto = require('crypto');
const {loadConfig} = require('./functions');
const {arrayToHex} = require('eosjs/dist/eosjs-serialize');
const watchers = require('./watchers');
const DacDirectory = require('./dac-directory');


class JobProcessor {
    constructor() {
        this.config = loadConfig();


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
        if (this.config.mongo) {
            return new Promise(async (resolve, reject) => {
                if (this.db) {
                    resolve(await this.db);
                    return
                }
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        console.log(`Connected to ${this.config.mongo.url}/${this.config.mongo.dbName}`);
                        resolve(client.db(this.config.mongo.dbName))
                    }
                }).bind(this))
            })
        }
    }

    async connectAmq() {
        console.log(`Connecting to AMQ`);
        RabbitSender.closeHandlers = [(() => {
            console.log('close handler');
            this.start()
        }).bind(this)];
        this.amq = RabbitSender.init(this.config.amq)

    }

    async processedActionJob(job, doc) {
        console.log(`Processed action job, notifying watchers`);
        this.amq.then((amq) => {
            amq.ack(job);
        });

        watchers.forEach((watcher) => {
            watcher.action({doc, dac_directory:this.dac_directory, db:this.db});
        });
    }

    async processActionJob(job) {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });

        const block_num = new Int64(sb.getUint8Array(8)).toString();
        const block_timestamp_arr = sb.getUint8Array(4);
        let buffer = Buffer.from(block_timestamp_arr);
        var block_timestamp_int = buffer.readUInt32BE(0);
        const block_timestamp = new Date(block_timestamp_int * 1000);
        const trx_id_arr = sb.getUint8Array(32);
        const trx_id = arrayToHex(trx_id_arr);
        const recv_sequence = new Int64(sb.getUint8Array(8)).toString();
        const global_sequence = new Int64(sb.getUint8Array(8)).toString();
        const account = sb.getName();
        const name = sb.getName();
        const data = sb.getBytes();

        console.log('Process action', block_num, account, name, recv_sequence, global_sequence);

        const action = {account, name, data};

        console.log(`Deserializing action ${account}:${name}`);

        let act;
        try {
            act = await this.api.deserializeActions([action]);
        } catch (e) {
            console.error(`Error deserializing action data ${account}:${name} - ${e.message}`);
            this.amq.then((amq) => {
                amq.ack(job)
            });
            return
        }


        delete act[0].authorization;

        const doc = {
            block_num: MongoLong.fromString(block_num),
            block_timestamp,
            trx_id,
            action: act[0],
            recv_sequence: MongoLong.fromString(recv_sequence),
            global_sequence: MongoLong.fromString(global_sequence)
        };

        console.log(doc);

        const self = this;

        this.db.then((db) => {
            const col = db.collection('actions');
            col.insertOne(doc).then(() => {
                console.log('Save completed');

                self.processedActionJob(job, doc)


            }).catch((e) => {
                if (e.code === 11000) { // Duplicate index
                    self.processedActionJob(job, doc)
                } else {
                    console.error('DB save failed :(', e);

                    this.amq.then((amq) => {
                        amq.reject(job)
                    })
                }
            })
        })
    }

    async processTransactionRow(job){
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });


    }

    async processContractRow(job) {
        const sb = new Serialize.SerialBuffer({
            textEncoder: new TextEncoder,
            textDecoder: new TextDecoder,
            array: new Uint8Array(job.content)
        });


        const block_num = new Int64(sb.getUint8Array(8)).toString();
        const present = sb.get();
        const block_timestamp_arr = sb.getUint8Array(4);
        // const block_timestamp_int = sb.getUint32();
        let buffer = Buffer.from(block_timestamp_arr);
        var block_timestamp_int = buffer.readUInt32BE(0);
        const block_timestamp = new Date(block_timestamp_int * 1000);
        sb.get(); // version
        const code = sb.getName();
        const scope = sb.getName();
        const table = sb.getName();
        const primary_key = new Int64(sb.getUint8Array(8)).toString();
        const payer = sb.getName();
        const data_raw = sb.getBytes();

        try {
            const table_type = await this.delta_handler.getTableType(code, table);
            const data_sb = new Serialize.SerialBuffer({
                textEncoder: new TextEncoder,
                textDecoder: new TextDecoder,
                array: data_raw
            });

            const data = table_type.deserialize(data_sb);

            if (code !== 'eosio') {
                // console.log(`row version ${row_version}`);
                // console.log(`code ${code}`);
                // console.log(`scope ${scope}`);
                // console.log(`table ${table}`);
                // console.log(`primary_key ${primary_key}`);
                // console.log(`payer ${payer}`);
                // // console.log(`data`)
                // console.log(data);

                console.log(`Storing ${code}:${table}:${block_timestamp_int}`);

                const data_hash = crypto.createHash('sha1').update(data_raw).digest('hex');

                const doc = {
                    block_num: MongoLong.fromString(block_num),
                    block_timestamp,
                    code,
                    scope,
                    table,
                    primary_key: MongoLong.fromString(primary_key),
                    payer,
                    data,
                    data_hash,
                    present
                };

                console.log(doc);

                this.db.then((db) => {
                    const col = db.collection('contract_rows');
                    col.insertOne(doc).then(() => {
                        console.log('Save completed');

                        this.amq.then((amq) => {
                            amq.ack(job)
                        })
                    }).catch((e) => {
                        this.amq.then((amq) => {
                            if (e.code === 11000) {
                                // duplicate index
                                amq.ack(job)
                            } else {
                                console.error('DB save failed :(', e);
                                amq.reject(job)
                            }
                        })
                    })
                })

            }
        } catch (e) {
            console.error(`Error deserializing ${code}:${table} : ${e.message}`);
            this.amq.then((amq) => {
                amq.ack(job)
            });

        }


    }


    async start() {
        this.connectAmq();
        await this.connectDb();

        this.delta_handler = new DeltaHandler({config: this.config, queue: this.amq});

        this.dac_directory = new DacDirectory({config: this.config, db:this.db});
        await this.dac_directory.reload();

        if (cluster.isMaster) {
            console.log(`Starting processor with ${this.config.clusterSize} threads...`);
            // kue.app.listen(3001)

            for (let i = 0; i < this.config.clusterSize; i++) {
                cluster.fork()
            }
        } else {
            const self = this;
            this.amq.then((amq) => {
                amq.listen('contract_row', self.processContractRow.bind(self));
                amq.listen('generated_transaction', self.processTransactionRow.bind(self));
                amq.listen('action', self.processActionJob.bind(self))
            })
        }
    }
}


const processor = new JobProcessor();
processor.start();
