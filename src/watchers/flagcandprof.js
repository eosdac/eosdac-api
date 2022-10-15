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
            await collection.createIndex({
                "block_num" : 1,
                "block" : 1,
                "cand" : 1,
                "dac_id" : 1
            }, { background:true });
            await collection.updateOne(
                flagDocument, 
                {
                  $setOnInsert: flagDocument
                },
                {upsert: true}
            ).then((result) => {
                console.log('Flag:', flagDocument)
                if (result.upsertedCount) {
                  this.logger.info(`Flag save complete`);
                } else if(result.matchedCount) {
                  this.logger.info('Flag already exists');
                }
            }).catch((e) => {
                this.logger.error('Flag save failed', {e});
          });
        }
    }
    async delta({doc, dac_directory, db}) {}

    async replay() {}
}

module.exports = new FlagsHandler();
