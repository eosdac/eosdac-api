#!/usr/bin/env node


const commander = require('commander');
const { Api, JsonRpc } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');
const fetch = require('node-fetch');

const { Connection } = require("./connection")

let rpc;
const signatureProvider = null;
const chainId = "e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473";


// const abiTypes = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), abiAbi);

const MongoLong = require('mongodb').Long;
const MongoClient = require('mongodb').MongoClient;


const url = 'mongodb://localhost:27017';
const dbName = 'eosdac';
const traceCollection = 'traces';
const stateCollection = 'states';


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function toJsonNoBin(x) {
    return JSON.stringify(x, (k, v) => {
        if (v instanceof Uint8Array)
            return "...";
        return v;
    }, 4)
}

class FillAPI {
    constructor({ startBlock = 0, endBlock = 0xffffffff, chain = 'jungle', irreversibleOnly = false, replay = false }) {
        let socketAddress
        switch (chain){
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
        }

        console.log(this.contracts)

        this.api = new Api({
            rpc, signatureProvider, chainId, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
        });

        this.chain = chain
        this.trace_collection = traceCollection + '_' + chain
        this.state_collection = stateCollection + '_' + chain

        this.head_block = 0;

        const self = this;
        MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
            if (err){
                console.error("\nFailed to connect\n", err)
            }
            else if (client){
                self.db = client.db(dbName);

                self.connection = new Connection({
                    socketAddress,
                    receivedAbi: async () => {
                        if (!replay) {
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

    interested(account, name){
        if (this.contracts.includes(account) || (account == 'eosio' && ['linkauth', 'unlinkauth'].includes(name))){
            return true
        }

        return false;
    }

    async handleFork(block_num){
        const col = this.db.collection(this.trace_collection)
        return col.deleteMany({block_num:{$gte:block_num}})
    }

    async handleAction(block_num, action){
        try {
            // console.log(action);
            // do not include receipt handlers
            if (this.interested(action.act.account, action.act.name) && action.receipt[1].receiver == action.act.account){
                //console.log("action\n", action);
                let actions = [];
                actions.push(action.act)
                this.api.deserializeActions(actions)
                    .then(act => {
                        for (let action_data of act){
                            const col = this.db.collection(this.trace_collection);
                            action_data.recv_sequence = new MongoLong.fromString(action.receipt[1].recv_sequence)
                            action_data.global_sequence = new MongoLong.fromString(action.receipt[1].global_sequence)
                            let doc = {block_num, action:action_data}
                            // console.log("ACT\n", act, "INSERT\n", doc, "\nACTION RECEIPT\n", action.receipt);
                            console.log("\nINSERT\n", doc);
                            col.updateOne({block_num}, {$addToSet:{actions:action_data}}, {upsert:true}).catch(console.log);
                        }
                    })
                    .catch(e => {
                        console.log("ERROR deserializeActions", e);
                    });
            }

            if (action.inline_traces.length){
                for (let itc of action.inline_traces){
                    //console.log("inline trace\n", itc);
                    if (itc[0] == 'action_trace_v0'){
                        this.handleAction(block_num, itc[1]);
                    }
                }
            }
        }
        catch (e){
            console.log(e);
        }

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

        if (!(block_num % 100))
            console.info("received block " + block_num);

        if (traces){
            for (let trace of traces){
                switch (trace[0]){
                    case 'transaction_trace_v0':
                        const trx = trace[1];
                        for (let action of trx.action_traces){
                            //console.log(action)
                            switch (action[0]){
                                case 'action_trace_v0':
                                    this.handleAction(block_num, action[1]);
                                    break;
                            }
                        }
                        break;
                }

            }
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
    .option('-c, --chain [jungle|mainnet]', 'Chain environment',  /^(jungle|mainnet)$/i, 'jungle')
    .option('-r, --replay', 'Force replay (ignore head block)', false)
    .parse(process.argv);

// const monitor = new Monitor(commander);
const fill = new FillAPI(commander);
