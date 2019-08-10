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

        this.logger = require('./connections/logger')('eosdac-processor', this.config.logger);
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
                        this.logger.info(`Connected to ${this.config.mongo.url}/${this.config.mongo.dbName}`);
                        resolve(client.db(this.config.mongo.dbName))
                    }
                }).bind(this))
            })
        }
    }

    async connectAmq() {
        this.logger.info(`Connecting to AMQ`);
        RabbitSender.closeHandlers = [(() => {
            this.logger.info('close handler');
            this.start()
        }).bind(this)];
        this.amq = RabbitSender.init(this.config.amq)

    }

    async processedActionJob(job, doc) {
        this.logger.info(`Processed action job, notifying watchers`);
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

        this.logger.info(`Process action ${block_num} ${account} ${name} ${recv_sequence} ${global_sequence}`);

        const action = {account, name, data};

        this.logger.info(`Deserializing action ${account}:${name}`);

        let act;
        try {
            act = await this.api.deserializeActions([action]);
        } catch (e) {
            this.logger.error(`Error deserializing action data ${account}:${name} - ${e.message}`, {e});
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

        const self = this;

        this.db.then((db) => {
            const col = db.collection('actions');
            col.insertOne(doc).then(() => {
                this.logger.info('Action save completed', {action:doc.action, block_num});

                self.processedActionJob(job, doc)


            }).catch((e) => {
                if (e.code === 11000) { // Duplicate index
                    self.processedActionJob(job, doc)
                } else {
                    this.logger.error('DB save failed :(', {e});

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
                // this.logger.info(`row version ${row_version}`);
                // this.logger.info(`code ${code}`);
                // this.logger.info(`scope ${scope}`);
                // this.logger.info(`table ${table}`);
                // this.logger.info(`primary_key ${primary_key}`);
                // this.logger.info(`payer ${payer}`);
                // // this.logger.info(`data`)
                // this.logger.info(data);

                this.logger.info(`Storing ${code}:${table}:${block_timestamp_int}`);

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

                this.db.then((db) => {
                    const col = db.collection('contract_rows');
                    col.insertOne(doc).then(() => {
                        this.logger.info('Contract row save completed', {dac_id:scope, code, scope, table, block_num});

                        this.amq.then((amq) => {
                            amq.ack(job)
                        })
                    }).catch((e) => {
                        this.amq.then((amq) => {
                            if (e.code === 11000) {
                                // duplicate index
                                amq.ack(job)
                            } else {
                                this.logger.error('Contract rowDB save failed :(', {e});
                                amq.reject(job)
                            }
                        })
                    })
                })

            }
        } catch (e) {
            this.logger.error(`Error deserializing ${code}:${table} : ${e.message}`, {e});
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
            this.logger.info(`Starting processor with ${this.config.clusterSize} threads...`);
            // kue.app.listen(3001)

            for (let i = 0; i < this.config.clusterSize; i++) {
                cluster.fork()
            }
        } else {
            const self = this;
            this.amq.then((amq) => {
                amq.listen('contract_row', self.processContractRow.bind(self));
                // amq.listen('generated_transaction', self.processTransactionRow.bind(self));
                amq.listen('action', self.processActionJob.bind(self))
            })
        }
    }
}


const processor = new JobProcessor();
processor.start();
