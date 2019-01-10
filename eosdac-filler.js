#!/usr/bin/env node

const fs = require('fs')
const commander = require('commander');
const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require('node-fetch');


var kue = require('kue')
const cluster = require('cluster')

let rpc;
const signatureProvider = null;




const {ActionHandler, BlockHandler} = require('./eosdac-handlers')
const BlockReceiver = require('./eosdac-blockreceiver')

// var access = fs.createWriteStream('filler.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)



class FillManager {
    constructor({ startBlock = 0, endBlock = 0xffffffff, config = 'jungle', irreversibleOnly = false, replay = false }) {
        this.config = require(`./${config}.config`)
        this.config_name = config
        this.start_block = startBlock
        this.end_block = endBlock
        this.replay = replay

        console.log(`Loading config ${config}.config.js`)
    }

    async run(){
        let queue

        let start_block = this.start_block

        // If replay is set then we start from block 0 in parallel and then start a serial handler from lib onwards
        // Otherwise we start from this.start_block in serial

        rpc = new JsonRpc(this.config.eos.endpoint, { fetch });
        this.api = new Api({
            rpc, signatureProvider, chainId:this.config.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });


        const action_handler = new ActionHandler({queue, config:this.config})
        const block_handler = new BlockHandler({queue, action_handler, config:this.config})

        if (this.replay){

            queue = kue.createQueue({
                prefix: this.config.redisPrefix,
                redis: this.config.redis
            })

            this.queue = queue


            if (cluster.isMaster){
                kue.app.listen(3000)

                const info = await this.api.rpc.get_info()
                const lib = info.last_irreversible_block_num

                let chunk_size = 500000
                let from = 0;
                let to = chunk_size; // to is not inclusive
                let break_now = false
                while (true){
                    console.log(`adding job for ${from} to ${to}`)
                    queue.create('block_range', {from, to}).removeOnComplete( true ).save()

                    if (to == lib){
                        break_now = true
                    }

                    from += chunk_size
                    to += chunk_size

                    if (to > lib){
                        to = lib
                    }

                    if (from > to){
                        break_now = true
                    }

                    // WARNING : debug
                    // if (to > 100000){
                    //     break_now = true;
                    // }

                    if (break_now){
                        break
                    }
                }

                for (let i = 0; i < this.config.fillClusterSize; i++) {
                    let worker = cluster.fork()
                    worker.on('exit', (code, signal) => {
                        if (signal) {
                            console.log(`FillManager : worker was killed by signal: ${signal}`);
                            let worker = cluster.fork()
                        } else if (code !== 0) {
                            console.log(`FillManager : worker exited with error code: ${code}`);
                        } else {
                            console.log('FillManager : worker success!');
                        }
                    });
                }

                // Start in serial mode from lib onwards
                this.br = new BlockReceiver({startBlock:lib, mode:0, config:this.config})
                this.br.registerTraceHandler(block_handler)
                this.br.start()
            }
            else {
                queue.process('block_range', 1, this.processBlockRange.bind(this))
            }

        }
        else {
            if (start_block === 0){
                // TODO: need to look for restart point
            }

            this.br = new BlockReceiver({startBlock:start_block, mode:0, config:this.config})
            this.br.registerTraceHandler(block_handler)
            this.br.start()
        }

    }

    async processBlockRange(job, done){
        const start_block = job.data.from
        const end_block = job.data.to

        console.log(`Starting block listener ${start_block} to ${end_block}`)

        const action_handler = new ActionHandler({queue:this.queue, config:this.config})
        const block_handler = new BlockHandler({queue:this.queue, action_handler, config:this.config})

        let br = new BlockReceiver({startBlock:start_block, endBlock:end_block, mode:1, config:this.config})
        br.registerTraceHandler(block_handler)
        br.registerDoneHandler(() => {
            console.log("Done with block range")
            done()
        })
        br.start()
    }
}

commander
    .version('0.1', '-v, --version')
    .option('-s, --start-block <start-block>', 'Start at this block')
    .option('-e, --end-block <end-block>', 'End block (exclusive)', 0xffffffff)
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  'jungle')
    .option('-r, --replay', 'Force replay (ignore head block)', false)
    .parse(process.argv);

// const monitor = new Monitor(commander);
// const fill = new FillAPI(commander);

const fm = new FillManager(commander)
fm.run()