#!/usr/bin/env node

const config = require("./config")

const commander = require('commander');
const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require('node-fetch');

const { Connection } = require("./connection")

var kue = require('kue')
const cluster = require('cluster')

let rpc;
const signatureProvider = null;


const MongoClient = require('mongodb').MongoClient;



class FillAPI {
    constructor({ startBlock = 0, endBlock = 0xffffffff, config = 'jungle', irreversibleOnly = false, replay = false }) {
        let socketAddress

        this.config = require(`./${config}.config`)
        this.config_name = config

        socketAddress = this.config.eos.wsEndpoint
        this.contracts = this.config.eos.contracts
        rpc = new JsonRpc(this.config.eos.endpoint, { fetch });

        /*switch (chain){
            case 'jungle':
                socketAddress = 'ws://jungle.eosdac.io:8080';
                this.contracts = ['kasdactokens', 'dacelections', 'eosdacdoshhq', 'dacmultisigs'];
                rpc = new JsonRpc("http://jungle2.eosdac.io:8882", { fetch });
                break;
            case 'mainnet':
                socketAddress = 'ws://as1.eosdac.io:8080';
                this.contracts = ['eosdactokens', 'daccustodian', 'eosdacthedac', 'dacmultisigs'];
                rpc = new JsonRpc("https://eu.eosdac.io", { fetch });
                break;
        }*/

        console.log(this.contracts)

        this.api = new Api({
            rpc, signatureProvider, chainId:this.config.chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });

        this.trace_collection = this.config.mongo.traceCollection + '_' + config
        this.state_collection = this.config.mongo.stateCollection + '_' + config

        this.head_block = 0;

        this.queue = kue.createQueue({
            prefix: 'q',
            redis: this.config.redis
        })

        console.log("Starting Kue admin interface")

        kue.app.listen(3000)

        console.log("Connecting to Mongo")

        const self = this;
        MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, function(err, client) {
            if (err){
                console.error("\nFailed to connect\n", err)
            }
            else if (client){
                self.db = client.db(self.config.mongo.dbName);

                self.connection = new Connection({
                    socketAddress,
                    receivedAbi: async () => {
                        if (!replay && startBlock == 0) {
                            console.log("Checking head block to continue")
                            const state_col = self.db.collection(self.state_collection);
                            let hb_data = await state_col.findOne({name: 'head_block'})
                            if (hb_data) {
                                startBlock = hb_data.block_num + 1
                            }
                        }

                        console.log(`Starting at block ${startBlock}`)


                        await self.start(irreversibleOnly, startBlock, endBlock);
                    },
                    receivedBlock: self.receivedBlock.bind(self),
                });
            }
        });


    }

    async start(irreversible_only, start_block, end_block) {
        try {
            this.connection.requestBlocks({
                irreversible_only,
                start_block_num: start_block,
                end_block_num: end_block,
                have_positions:[],
                fetch_block: false,
                fetch_traces: true,
                fetch_deltas: false,
            });
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }


    async handleFork(block_num){
        const col = this.db.collection(this.trace_collection)
        return col.deleteMany({block_num:{$gte:block_num}})
    }

    async queueAction(block_num, action){
        // console.log(action)
        let data = {
            block_num,
            action:action.act,
            receiver:action.receipt[1].receiver,
            receiver_sequence: action.receipt[1].recv_sequence,
            global_sequence: action.receipt[1].global_sequence
        }
        this.queue.create('action', data).save()


        if (action.inline_traces.length){
            for (let itc of action.inline_traces){
                //console.log("inline trace\n", itc);
                if (itc[0] == 'action_trace_v0'){
                    await this.queueAction(block_num, itc[1]);
                }
            }
        }
    }

    async queueBlock(block_num, traces){
        let data = {block_num, traces}
        this.queue.create('block_traces', data).save()
    }


    async receivedBlock(response, block, traces, deltas) {
        if (!response.this_block)
            return;
        let block_num = response.this_block.block_num;

        if ( block_num <= this.head_block ){
            console.log(`Detected fork: current:${block_num} <= head:${this.head_block}`)
            await this.handleFork(block_num)
        }

        this.head_block = block_num;

        if (!(block_num % 100)){
            console.info("received block " + block_num);
            this.queue.inactiveCount((err, total) => {
                console.info("redis queue length " + total)
            })
        }

        if (traces){
            this.queueBlock(block_num, traces)
        }

        const state_col = this.db.collection(this.state_collection);
        state_col.updateOne({name:'head_block'}, {$set:{block_num}}, {upsert:true})

    } // receivedBlock
} // FillAPI


commander
    .version('0.1', '-v, --version')
    .option('-s, --start-block <start-block>', 'Start at this block')
    .option('-e, --end-block <end-block>', 'End block', 0xffffffff)
    .option('-i, --irreversible-only', 'Only follow irreversible', false)
    .option('-c, --config <config>', 'Config prefix, will load <config>.config.js from the current directory',  /^([a-z0-9*])$/i, 'jungle')
    .option('-r, --replay', 'Force replay (ignore head block)', false)
    .parse(process.argv);

// const monitor = new Monitor(commander);
const fill = new FillAPI(commander);
