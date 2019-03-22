
class TraceHandler {
    constructor({queue, action_handler, config}) {
        this.amq = queue;
        this.action_handler = action_handler;
        this.config = config;
    }

    async queueTrace(block_num, traces) {
        return this.processTrace(block_num, traces)

    }

    async processTrace(block_num, traces) {
        // console.log(`Process block ${block_num}`)

        for (const trace of traces) {
            switch (trace[0]) {
                case 'transaction_trace_v0':
                    const trx = trace[1];
                    // console.log(trx)
                    for (let action of trx.action_traces) {
                        //console.log(action)
                        switch (action[0]) {
                            case 'action_trace_v0':
                                this.action_handler.queueAction(block_num, action[1], trx.id);
                                break;
                        }
                    }
                    break;
            }

        }
    }

}


module.exports = TraceHandler;