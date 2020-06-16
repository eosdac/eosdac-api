
const MongoClient = require('mongodb').MongoClient;

class BlockHandler {
    constructor({config}) {
        this.config = config;
        this.currentBlock = 0;
        this.connectDb();
        setInterval(this.writeProgress.bind(this), 10000);
    }

    async connectDb() {
        this.db = await this._connectDb();
        this.db.collection('state').createIndex({
            "name" : 1
        }, {unique:true, background:true});
    }

    _connectDb() {
        if (this.config.mongo) {
            return new Promise((resolve, reject) => {
                MongoClient.connect(this.config.mongo.url, {useNewUrlParser: true}, (err, client) => {
                    if (err) {
                        reject(err)
                    } else {
                        const db = client.db(this.config.mongo.dbName);
                        resolve(db);
                    }
                });
            })
        }
    }

    writeProgress (block_num) {
        const coll = this.db.collection('state');
        coll.updateOne({name: 'current_block'}, {$set: {value: this.currentBlock}}, {upsert: true});
    }

    processBlock(block_num, block) {
        this.currentBlock = block_num;
    }
}

module.exports = BlockHandler;
