#!/usr/bin/env node

process.title = 'eosdac-processor';

const cluster = require('cluster');

const {TextDecoder, TextEncoder} = require('text-encoding');
const {Api, JsonRpc, Serialize} = require('@jafri/eosjs2');
const {DeltaHandler} = require('./handlers');
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const MongoLong = require('mongodb').Long;
const Amq = require('./connections/amq');
const connectMongo = require('./connections/mongo');
const Int64 = require('int64-buffer').Int64BE;
const crypto = require('crypto');
const {loadConfig} = require('./functions');
const {arrayToHex} = require('@jafri/eosjs2/dist/eosjs-serialize');
const watchers = require('./watchers');
const DacDirectory = require('./dac-directory');
const {IPC} = require('node-ipc');


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
        if (this.config.mongo) {
            this.db = await connectMongo(this.config);
        }
    }

    async connectAmq() {
        this.amq = new Amq(this.config);
        return await this.amq.init();
    }

    async processedActionJob(job, doc) {
        this.logger.info(`Processed action job, notifying watchers`);
        this.amq.ack(job);

        watchers.forEach((watcher) => {
            watcher.action({doc, dac_directory:this.dac_directory, db:this.db});
        });

        // broadcast to master, to send via ipc
        try {
            process.send(doc);
        }
        catch (e){}

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

        let dac_id = '';
        if (act[0].data.dac_id){
            dac_id = act[0].data.dac_id;
        }

        const col = this.db.collection('actions');
        col.insertOne(doc).then(() => {
            const action_log_meta = {action:doc.action, block_num};
            if (dac_id){
                action_log_meta.dac_id = dac_id;
            }
            this.logger.info('Action save completed', action_log_meta);

            self.processedActionJob(job, doc);


        }).catch((e) => {
            if (e.code === 11000) { // Duplicate index
                self.processedActionJob(job, doc);
            } else {
                this.logger.error('DB save failed :(', {e});

                this.amq.then((amq) => {
                    amq.reject(job);
                })
            }
        });
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

                const col = this.db.collection('contract_rows');
                col.insertOne(doc).then(() => {
                    this.logger.info('Contract row save completed', {dac_id:scope, code, scope, table, block_num});
                    this.amq.ack(job);
                }).catch((e) => {
                    if (e.code === 11000) {
                        // duplicate index
                        this.amq.ack(job)
                    } else {
                        this.logger.error('Contract rowDB save failed :(', {e});
                        this.amq.reject(job)
                    }
                });

            }
        } catch (e) {
            this.logger.error(`Error deserializing ${code}:${table} : ${e.message}`, {e});
            this.amq.ack(job);
        }


    }

    worker_message(doc){
        this.ipc.server.broadcast('action', doc);
    }

    async start() {
        await this.connectAmq();
        await this.connectDb();

        this.delta_handler = new DeltaHandler({config: this.config, queue: this.amq});

        this.dac_directory = new DacDirectory({config: this.config, db:this.db});
        await this.dac_directory.reload();

        if (cluster.isMaster) {
            this.logger.info(`Starting processor with ${this.config.clusterSize} threads...`);
            // start ipc server that clients can subscribe to for api cache updates
            this.ipc = new IPC();
            this.ipc.config.appspace = 'eosdac.';
            this.ipc.config.id = 'eosdacprocessor';
            this.ipc.serve(() => {
                this.logger.info(`Started IPC`);
            });
            this.ipc.server.start();


            for (let i = 0; i < this.config.clusterSize; i++) {
                const worker = cluster.fork();
                worker.on('message', this.worker_message.bind(this));
            }
        } else {
            this.amq.listen('contract_row', this.processContractRow.bind(this));
            // amq.listen('generated_transaction', self.processTransactionRow.bind(self));
            this.amq.listen('action', this.processActionJob.bind(this));
        }
    }
}


const processor = new JobProcessor();
processor.start();
