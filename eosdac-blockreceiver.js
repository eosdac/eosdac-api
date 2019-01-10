
const MongoClient = require('mongodb').MongoClient
const { Connection } = require("./connection")


class BlockReceiver {
    /* mode 0 = serial, 1 = parallel */
    constructor({ startBlock = 0, endBlock = 0xffffffff, config, mode = 0 }){
        this.trace_handlers = []
        this.done_handlers = []

        // console.log(config)

        this.config = config
        this.mode = mode

        this.start_block = startBlock
        this.end_block = endBlock
        this.current_block = -1
        this.complete = true

        this.state_collection = 'state'

    }

    registerDoneHandler(h){
        this.done_handlers.push(h)
    }

    registerTraceHandler(h){
        this.trace_handlers.push(h)
    }

    status(){
        const start = this.start_block
        const end = this.end_block
        const current = this.current_block

        return {start, end, current}
    }

    async start(){
        // TODO: check for resume data

        if (this.connection){
            this.connection = null
        }

        this.complete = false

        this.db = await this.connectDb()

        this.connection = new Connection({
            socketAddress: this.config.eos.wsEndpoint,
            receivedAbi: this.requestBlocks.bind(this),
            receivedBlock: this.receivedBlock.bind(this),
        });
    }

    async connectDb(){
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                if (err){
                    reject(err)
                }
                else {
                    resolve(client.db(this.config.mongo.dbName))
                }
            }).bind(this))
        })
    }

    async requestBlocks(){
        try {
            await this.connection.requestBlocks({
                irreversibleOnly:false,
                start_block_num: this.start_block,
                end_block_num: this.end_block,
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
        const trace_collection = this.config.mongo.traceCollection
        const col = this.db.collection(trace_collection)
        return col.deleteMany({block_num:{$gte:block_num}})
    }

    async receivedBlock(response, block, traces, deltas) {
        if (!response.this_block)
            return;
        let block_num = response.this_block.block_num;

        if ( this.mode === 0 && block_num <= this.current_block ){
            console.log(`Detected fork in serial mode: current:${block_num} <= head:${this.current_block}`)
            await this.handleFork(block_num)
        }

        this.complete = false

        this.current_block = block_num

        if (!(block_num % 100)){
            console.info(`BlockReceiver : received block ${block_num}`);
            let {start, end, current} = this.status()
            console.info(`Start: ${start}, End: ${end}, Current: ${current}`)

            // this.connection.requestStatus()
            // this.queue.inactiveCount((err, total) => {
            //     console.info("redis queue length " + total)
            // })
        }

        if (traces){
            this.trace_handlers.map((handler) => {
                if (this.mode === 0){
                    handler.processBlock(block_num, traces)
                }
                else {
                    handler.queueBlock(block_num, traces)
                }
            })
        }

        if (this.current_block === this.end_block -1){
            console.log("Im done")
            this.complete = true
            this.done_handlers.map((handler) => {
                handler()
            })
        }

        // const state_col = this.db.collection(this.state_collection);
        // state_col.updateOne({name:'head_block'}, {$set:{block_num}}, {upsert:true})

    } // receivedBlock
}


module.exports = BlockReceiver