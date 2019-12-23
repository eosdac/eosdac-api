#!/usr/bin/env node

process.title = 'eosdac-blockrange';

const commander = require('commander');
const {loadConfig} = require('./functions');
const Int64BE = require('int64-buffer').Int64BE;
const DacDirectory = require('./dac-directory');

const {ActionHandler, TraceHandler, DeltaHandler} = require('./handlers');
const StateReceiver = require('../eosio-statereceiver');

const Amq = require('./connections/amq');
const cluster = require('cluster');


class BlockRangeManager {
    constructor({startBlock = 0, endBlock = 0xffffffff, config = '', irreversibleOnly = false, replay = false, test = 0, processOnly = false}) {
        this.config = loadConfig();
        this.start_block = startBlock;
        this.end_block = endBlock;
        this.replay = replay;
        this.br = null;
        this.test_block = test;
        this.job = null;
        this.process_only = processOnly;

        console.log(`Loading config ${this.config.name}.config.js`);

        this.logger = require('./connections/logger')('eosdac-blockrange', this.config.logger);
    }

    async run() {
        cluster.on('exit', this.workerExit.bind(this));

        if (cluster.isMaster) {
            this.logger.info(`Starting block_range listener only`);

            for (let i = 0; i < this.config.fillClusterSize; i++) {
                cluster.fork();
            }
        } else {

            this.amq = new Amq(this.config);
            await this.amq.init();

            this.logger.info(`Listening to queue for block_range ONLY`);
            this.amq.listen('block_range', this.processBlockRange.bind(this));
        }

    }

    workerExit(worker, code, signal) {
        this.logger.info(`Process exit`);
        if (signal) {
            this.logger.warn(`FillManager : worker was killed by signal: ${signal}`);
        } else if (code !== 0) {
            this.logger.warn(`FillManager : worker exited with error code: ${code}`);
        } else {
            if (this.job) {
                // Job success
                this.amq.ack(this.job);
            }
            this.logger.info('FillManager : worker success!');
        }

        if (worker.isDead()) {
            if (this.job) {
                this.amq.reject(this.job);
            }

            this.logger.warn(`FillManager : Worker is dead, starting a new one`);
            cluster.fork();

            if (worker.isMaster) {
                this.logger.error('FillManager : Main thread died :(')
            }
        }

    }

    async processBlockRange(job) {
        this.job = job;
        //await this.amq.ack(job)

        const start_buffer = job.content.slice(0, 8);
        const end_buffer = job.content.slice(8);

        const start_block = new Int64BE(start_buffer).toString();
        const end_block = new Int64BE(end_buffer).toString();

        this.logger.info(`processBlockRange pid : ${process.pid} ${start_block} to ${end_block}`);

        const dac_directory = new DacDirectory({config: this.config, db:this.db});
        await dac_directory.reload();

        const action_handler = new ActionHandler({queue: this.amq, config: this.config, dac_directory, logger:this.logger});
        const block_handler = new TraceHandler({queue: this.amq, action_handler, config: this.config, logger:this.logger});
        const delta_handler = new DeltaHandler({queue: this.amq, config: this.config, dac_directory, logger:this.logger});


        this.br = new StateReceiver({startBlock: start_block, endBlock: end_block, mode: 1, config: this.config});
        this.br.registerDeltaHandler(delta_handler);
        this.br.registerTraceHandler(block_handler);
        this.br.registerDoneHandler(() => {
            // this.logger.info(`StateReceiver completed`, job)
            this.amq.ack(job);
            this.logger.info(`Finished job ${start_block}-${end_block}`);
        });

        this.logger.info('StateReceiver created');


        // start the receiver
        try {
            this.br.start();
            this.logger.info('Started StateReceiver');
        } catch (e) {
            this.logger.error(`ERROR starting StateReceiver : ${e.message}`, e);
        }
        //}
    }
}

commander
    .version('0.1', '-v, --version')
    .parse(process.argv);


const bm = new BlockRangeManager(commander);
bm.run();
