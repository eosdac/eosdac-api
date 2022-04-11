
class TraceHandler {
    constructor({queue, action_handler, config, logger}) {
        this.amq = queue;
        this.action_handler = action_handler;
        this.config = config;
        this.logger = logger;
    }

    async queueTrace(block_num, traces, block_timestamp) {
        
        for (const trace of traces) {
            switch (trace[0]) {
                case 'transaction_trace_v0':
                    const trx = trace[1];
                    // console.log(trx)
                    for (let action of trx.action_traces) {
                        //console.log(action)
                        switch (action[0]) {
                            case 'action_trace_v0':
                                this.action_handler.queueAction(block_num, action[1], trx.id, block_timestamp);
                                break;
                        }
                    }
                    break;
            }

        }
    }

    async processTrace(block_num, traces, block_timestamp) {
        // console.log(`Process block ${block_num}`)
        return this.queueTrace(block_num, traces, block_timestamp);
    }

}


module.exports = TraceHandler;
