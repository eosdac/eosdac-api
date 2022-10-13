const {loadConfig} = require('../functions');

const config = loadConfig();

class FlagsHandler {

    constructor() {
        this.logger = require('../connections/logger')('watcher-multisig', config.logger);
    }

    async action({doc, dac_directory, db}) {
        const {
            action: {
                account,
                name,
                data: {
                    block,
                    cand,
                    dac_id,
                    reason,
                    reporter
                }
            },
            block_num
        } = doc;
        if (account === config.eos.custodianContract && name === 'flagcandprof'){
            const flagDocument = {
                block_num,
                cand,
                reason,
                reporter,
                dac_id,
                block,
            };

            const collection = db.collection('flags');
            collection.insertOne(flagDocument).then(() => {
                this.logger.info('Flag save completed');
            }).catch((e) => {
            if (e.code === 11000) {
                this.logger.info('Flag save failed - duplicate');
            } else {
                this.logger.error('Flag save failed', {e});
            }
        });
        }
    }
    async delta({doc, dac_directory, db}) {}

    async replay() {}
}

module.exports = new FlagsHandler();
