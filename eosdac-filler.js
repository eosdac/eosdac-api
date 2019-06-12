#!/usr/bin/env node

const commander = require('commander');
const {Api, JsonRpc} = require('eosjs');
const {TextDecoder, TextEncoder} = require('text-encoding');
const fetch = require('node-fetch');
const {loadConfig, getRestartBlock} = require('./functions');


// const kue = require('kue')
const RabbitSender = require('./rabbitsender');
const cluster = require('cluster');
const Int64BE = require('int64-buffer').Int64BE;
const DacDirectory = require('./dac-directory');

let rpc;
const signatureProvider = null;


const {ActionHandler, TraceHandler, DeltaHandler} = require('./handlers');
const StateReceiver = require('../eosio-statereceiver');

// var access = fs.createWriteStream('filler.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)


class FillManager {
    constructor({startBlock = 0, endBlock = 0xffffffff, config = '', irreversibleOnly = false, replay = false, test = 0, processOnly = false}) {
        this.config = loadConfig();
        this.start_block = startBlock;
        this.end_block = endBlock;
        this.replay = replay;
        this.br = null;
        this.test_block = test;
        this.job = null;
        this.process_only = processOnly;

        console.log(`Loading config ${this.config.name}.config.js`)
    }

    async run() {
        rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });

        const info = await this.api.rpc.get_info();
        const lib = info.last_irreversible_block_num;

        let start_block = this.start_block;
        if (start_block === -1) {
            start_block = await getRestartBlock();
            console.log(`Starting from block ${start_block}, LIB is ${lib}`)
        }

        // If replay is set then we start from block 0 in parallel and then start a serial handler from lib onwards
        // Otherwise we start from this.start_block in serial


        cluster.on('exit', this.workerExit.bind(this));

        this.amq = RabbitSender.init(this.config.amq);

        const interested_contracts = new DacDirectory({config: this.config, db:this.db});
        await interested_contracts.reload();

        const action_handler = new ActionHandler({queue: this.amq, config: this.config, interested_contracts});
        const block_handler = new TraceHandler({queue: this.amq, action_handler, config: this.config});
        const delta_handler = new DeltaHandler({queue: this.amq, config: this.config, interested_contracts});

        if (this.replay) {

            if (cluster.isMaster) {

                console.log(`Replaying from ${this.start_block} in parallel mode`);


                let chunk_size = 10000;
                const range = lib - this.start_block;

                if (chunk_size > (range / this.config.fillClusterSize)) {
                    console.log('small chunks');
                    chunk_size = parseInt((range) / this.config.fillClusterSize)
                }

                let from = parseInt(this.start_block);
                if (isNaN(from) || from === -1) {
                    from = 0
                }
                let to = from + chunk_size; // to is not inclusive

                let break_now = false;
                let number_jobs = 0;
                while (true) {
                    console.log(`adding job for ${from} to ${to}`);
                    let from_buffer = new Int64BE(from).toBuffer();
                    let to_buffer = new Int64BE(to).toBuffer();

                    this.amq.then((amq) => {
                        amq.send('block_range', Buffer.concat([from_buffer, to_buffer]))
                    });
                    number_jobs++;

                    if (to === lib) {
                        break_now = true
                    }

                    from += chunk_size;
                    to += chunk_size;

                    if (to > lib) {
                        to = lib
                    }

                    if (from > to) {
                        break_now = true
                    }

                    if (break_now) {
                        break
                    }
                }

                console.log(`Queued ${number_jobs} jobs`);

                for (let i = 0; i < this.config.fillClusterSize; i++) {
                    cluster.fork()
                }

                // Start from current lib
                this.br = new StateReceiver({startBlock: lib, mode: 1, config: this.config});
                this.br.registerTraceHandler(block_handler);
                this.br.registerDeltaHandler(delta_handler);
                this.br.start()
            } else {
                //queue.process('block_range', 1, this.processBlockRange.bind(this))
                this.amq = RabbitSender.init(this.config.amq);

                console.log(`Listening to queue for block_range`);
                this.amq.then((amq) => {
                    amq.listen('block_range', this.processBlockRange.bind(this))
                })
            }

        } else if (this.test_block) {
            // const action_handler = new ActionHandler({queue: this.amq, config: this.config})
            // const block_handler = new TraceHandler({queue: this.amq, action_handler, config: this.config})
            const delta_handler = new DeltaHandler({queue: this.amq, config: this.config});


            console.log(`Testing single block ${this.test_block}`);
            this.br = new StateReceiver({
                startBlock: this.test_block,
                endBlock: this.test_block + 1,
                mode: 1,
                config: this.config
            });
            this.br.registerTraceHandler(block_handler);
            this.br.registerDeltaHandler(delta_handler);
            this.br.registerDoneHandler(() => {
                console.log('Test complete')
                // process.exit(0)
            });
            this.br.start()
        } else if (this.process_only) {
            if (cluster.isMaster) {
                //kue.app.listen(3000)

                console.log(`Starting block_range listener only`);

                for (let i = 0; i < this.config.fillClusterSize; i++) {
                    cluster.fork()
                }
            } else {
                this.amq = RabbitSender.init(this.config.amq);

                console.log(`Listening to queue for block_range ONLY`);
                this.amq.then((amq) => {
                    amq.listen('block_range', this.processBlockRange.bind(this))
                })
            }
        } else {
            if (start_block <= 1 && this.config.eos.dacGenesisBlock) {
                start_block = parseInt(this.config.eos.dacGenesisBlock);
                if (isNaN(start_block)){
                    throw new Error(`Invalid eos.dacGenesisBlock value "${this.config.eos.dacGenesisBlock}"`);
                }
            }

            console.log(`No replay, starting at block ${start_block}`);

            this.br = new StateReceiver({startBlock: start_block, mode: 0, config: this.config});
            this.br.registerTraceHandler(block_handler);
            this.br.registerDeltaHandler(delta_handler);
            this.br.start()
        }

    }

    workerExit(worker, code, signal) {
        console.log(`Process exit`);
        if (signal) {
            console.error(`FillManager : worker was killed by signal: ${signal}`);
        } else if (code !== 0) {
            console.error(`FillManager : worker exited with error code: ${code}`);
        } else {
            if (this.job) {
                // Job success
                this.amq.then((amq) => {
                    amq.ack(this.job)
                })
            }
            console.log('FillManager : worker success!');
        }

        if (worker.isDead()) {
            if (this.job) {
                const job = this.job;
                this.amq.then((amq) => {
                    amq.reject(job)
                })
            }

            console.error(`FillManager : Worker is dead, starting a new one`);
            cluster.fork();

            if (worker.isMaster) {
                console.error('FillManager : Main thread died :(')
            }
        }

    }

    async processBlockRange(job) {
        console.log(`processBlockRange pid : ${process.pid}`, job.content);
        this.job = job;
        //await this.amq.ack(job)

        const start_buffer = job.content.slice(0, 8);
        const end_buffer = job.content.slice(8);

        const start_block = new Int64BE(start_buffer).toString();
        const end_block = new Int64BE(end_buffer).toString();

        // used if the process dies
        // this.job_done = this.amq.ack

        console.log(`Starting block listener ${start_block} to ${end_block}`);

        /*if (this.br) {
            console.log("Already have StateReceiver")
            this.br.restart(start_block, end_block)
            this.br.registerDoneHandler(() => {
                this.amq.then((amq) => {
                    amq.ack(job)
                })
                console.log(`Finished job ${start_block}-${end_block}`, job)
            })
        } else {*/

        const interested_contracts = new DacDirectory({config: this.config, db:this.db});
        await dac_directory.reload();

        const action_handler = new ActionHandler({queue: this.amq, config: this.config, dac_directory});
        const block_handler = new TraceHandler({queue: this.amq, action_handler, config: this.config});
        const delta_handler = new DeltaHandler({queue: this.amq, config: this.config, dac_directory});


        this.br = new StateReceiver({startBlock: start_block, endBlock: end_block, mode: 1, config: this.config});
        this.br.registerDeltaHandler(delta_handler);
        this.br.registerTraceHandler(block_handler);
        this.br.registerDoneHandler(() => {
            // console.log(`StateReceiver completed`, job)
            this.amq.then((amq) => {
                amq.ack(job)
            });
            console.log(`Finished job ${start_block}-${end_block}`)
        });

        console.log('StateReceiver created');


        // start the receiver
        try {
            this.br.start();
            console.log('Started StateReceiver')
        } catch (e) {
            console.error(`ERROR starting StateReceiver : ${e.message}`)
        }
        //}
    }
}

commander
    .version('0.1', '-v, --version')
    .option('-s, --start-block <start-block>', 'Start at this block', -1)
    .option('-t, --test <block>', 'Test mode, specify a single block to pull and process', parseInt, 0)
    .option('-e, --end-block <end-block>', 'End block (exclusive)', parseInt, 0xffffffff)
    .option('-r, --replay', 'Force replay (ignore head block)', false)
    .option('-p, --process-only', 'Only process queue items (do not populate)', false)
    .parse(process.argv);


const fm = new FillManager(commander);
fm.run();