const MongoClient = require('mongodb').MongoClient;

const RabbitSender = require('../rabbitsender')
const Int64 = require('int64-buffer').Int64BE;


class TraceHandler {
    constructor({queue, action_handler, config}) {
        this.amq = queue;
        this.action_handler = action_handler;
        this.config = config;
        this.block_insert_queue = [];

        setInterval(this.flushQueue.bind(this), 10000);

        this.connectDb()
        this.connectAmq()
    }

    async connectAmq(){
        this.amq = RabbitSender.init(this.config.amq)
    }

    async connectDb() {
        this.db = await this._connectDb()
    }

    async _connectDb() {
        if (this.config.mongo){
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, ((err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        const db = client.db(this.config.mongo.dbName);
                        // const col_traces = db.collection(this.config.mongo.traceCollection)
                        // col_traces.createIndex({block_num:-1})
                        resolve(db)
                    }
                }).bind(this))
            })
        }
    }

    async queueTrace(block_num, traces) {
        return this.processTrace(block_num, traces)

    }

    async processTraceJob(job, done) {
        //console.log(`Processing job : ${job.id}, type : ${job.type}`)
        const traces = job.data.traces;
        const block_num = job.data.block_num;

        try {
            await this.processTrace(block_num, traces);

            done()
        } catch (e) {
            done(e)
        }
    }

    async processTrace(block_num, traces) {
        // console.log(`Process block ${block_num}`)

        for (const trace of traces) {
            switch (trace[0]) {
                case 'transaction_trace_v0':
                    const trx = trace[1];
                    for (let action of trx.action_traces) {
                        //console.log(action)
                        switch (action[0]) {
                            case 'action_trace_v0':
                                this.action_handler.queueAction(block_num, action[1]);
                                break;
                        }
                    }
                    break;
            }

        }

        // this.block_insert_queue.push({"insertOne":{block_num, actions:[]}})


    }

    async flushQueue(){
        if (this.block_insert_queue.length){
            const trace_col = this.db.collection('traces');
            trace_col.bulkWrite(this.block_insert_queue, {ordered :false}).catch((e) => {})
        }
    }
}


module.exports = TraceHandler