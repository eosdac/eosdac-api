
class InterestedContracts {
    constructor({config, db}){
        this.interested_queue = new Map;
        this.config = config;
        this.db = db;
        this.interested_timeout = null;
    }

    add(account, dac_name) {
        this.interested_contracts.add(account);

        if (!this.interested_queue.has(dac_name)){
            this.interested_queue.set(dac_name, new Set);
        }
        this.interested_queue.get(dac_name).add(account);

        if (!this.interested_timeout){
            this.interested_timeout = setTimeout(this.save.bind(this), 5000);
        }
    }

    async save() {
        const db = await this.db;
        const coll = db.collection('interested_contracts');

        this.interested_queue.forEach((accounts, dac_name) => {
            coll.updateOne({dac_name:dac_name}, {$addToSet: {accounts:{$each:Array.from(accounts)}}}, {upsert:true});
        });

        this.interested_queue = new Set
    }

    async reload() {
        this.interested_contracts = new Set();
        const coll = this.db.collection('interested_contracts');
        const res = await coll.find({});
        res.forEach((row) => {
            // console.log(row.accounts);
            row.accounts.forEach((acnt) => {
                // console.log(`Adding ${acnt} to set`);
                this.interested_contracts.add(acnt);
            });
        });
    }

    has(value) {
        return this.interested_contracts.has(value);
    }
}

module.exports = InterestedContracts;