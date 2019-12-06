const MongoClient = require('mongodb').MongoClient;


async function connectMongo(config) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.mongo.url, {useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
            if (err) {
                console.error("\nFailed to connect\n", err);
                reject(err)
            } else if (client) {
                console.log(`Connected to mongo at ${config.mongo.url}`);
                resolve(client.db(config.mongo.dbName))
            }
        });
    });
}


module.exports = connectMongo;