const connectMongo = require('../connections/mongo')
const { loadConfig } = require('../functions')

const { TextDecoder, TextEncoder } = require('text-encoding');
const {Api, JsonRpc, Serialize} = require('eosjs');
const fetch = require('node-fetch');

const config = loadConfig()

const eosTableAtBlock = require('../eos-table')


class MultisigProposalsHandler {

    constructor(){
        this.config = loadConfig()
        this.db = connectMongo(config)

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});
        this.api = new Api({
            rpc,
            signatureProvider: null,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
    }

    async permissionToThreshold(perm){
        return new Promise(async (resolve, reject) => {
            const auth_account = 'dacauthority'
            const self = this

            if (perm.actor == auth_account){
                switch (perm.permission){
                    case 'low':
                        resolve(7)
                        break
                    case 'med':
                        resolve(9)
                        break
                    case 'high':
                    case 'active':
                        resolve(10)
                        break
                }
            }
            else {
                // get the account and follow the tree down
                const acct = await this.api.rpc.get_account(perm.actor)
                // console.log(acct)
                const thresholds = []

                for (let p=0;p<acct.permissions.length;p++){
                    const act_perm = acct.permissions[p]

                    if (act_perm.perm_name == perm.permission){
                        // console.log(act_perm, act_perm.required_auth.accounts)

                        if (act_perm.required_auth.accounts.length == 0){
                            resolve(0)
                        }


                        for (let a=0;a<act_perm.required_auth.accounts.length;a++){
                            const perm = act_perm.required_auth.accounts[a]
                            // console.log('getting permission', perm)
                            const p = await self.permissionToThreshold(perm.permission)
                            // console.log('got perm')
                            thresholds.push(p)
                        }

                        // console.log('thresholds', thresholds, Math.max(...thresholds))

                    }
                }

                if (!thresholds.length){
                    resolve(0)
                }
                else {
                    resolve(Math.max(...thresholds))
                }
            }
        })

    }

    async getTrxThreshold(trx){
        const self = this
        const thresholds = []

        return new Promise(async (resolve, reject) => {
            for (let a=0;a<trx.actions.length;a++){
                const act = trx.actions[a]

                for (let p=0;p<act.authorization.length;p++){
                    const perm = act.authorization[p]

                    thresholds.push(await self.permissionToThreshold(perm))
                }

                resolve(Math.max(...thresholds))
            }
        })
    }

    async replay(){
        this.db.then(async (mongo) => {
            const db = mongo.db(this.config.mongo.dbName)
            const collection = db.collection('multisigs');
            const collection_actions = db.collection('actions');

            console.log('Removing existing entries')
            await collection.deleteMany({})
            console.log(await collection.find({}).count())

            const res = collection_actions.find({'action.account': 'dacmultisigs', 'action.name': 'proposed'}).sort({block_num:1})
            let doc
            let count = 0
            while (doc = await res.next()){
                await this.recalcMsigs(doc)
                count++
            }

            console.log(`Imported ${count} documents`)
            process.exit(0)
        })
    }

    async recalcMsigs(doc){
        // console.log('Recalc', doc)
        const mongo = await this.db
        const db = mongo.db(this.config.mongo.dbName)
        const coll = db.collection('multisigs')
        const coll_actions = db.collection('actions')

        const block_num = doc.block_num
        const proposer = doc.action.data.proposer
        const proposal_name = doc.action.data.proposal_name
        let metadata = ''
        try {
            metadata = JSON.parse(doc.action.data.metadata)
        }
        catch (e){
            try {
                const dJSON = require('dirty-json')
                metadata = dJSON.parse(doc.action.data.metadata)
                console.log(`Used dirty-json to parse ${doc.action.data.metadata}`)
            }
            catch (e){
                metadata = {title:'', description:''}
                console.error(doc.action.data.metadata, e.message)
            }



        }

        const output = {proposer, proposal_name, title:metadata.title, description:metadata.description, threshold:0, requested_approvals:[], provided_approvals:[]}

        // console.log(`${block_num}:${proposer}:${proposal_name}`, metadata)

        const data_query = {
            proposal_name
        }
        const local_data_query = {
            proposalname:proposal_name
        }

        const res_proposals = await eosTableAtBlock({code:'eosiomsigold', scope:proposer, table:'proposal', block_num:block_num+1, data_query})
        const res_approvals = await eosTableAtBlock({code:'eosiomsigold', scope:proposer, table:'approvals', block_num:block_num+1, data_query})

        for (let r=0;r<res_proposals.results.length;r++){
            const proposal = res_proposals.results[r]

            // console.log(proposal.block_num, proposal.data.proposal_name, proposal.data.packed_transaction)
            const trx = await this.api.deserializeTransactionWithActions(proposal.data.packed_transaction)
            output.trx = trx

            // get the trxid stored in the dacmultisigs table
            const res_data = await eosTableAtBlock({code:'dacmultisigs', scope:proposer, table:'proposals', block_num:block_num+1, data_query:local_data_query})
            // console.log(await res_data.results[0].data.transactionid)
            output.trxid = res_data.results[0].data.transactionid
        }

        if (res_approvals.count){
            output.requested_approvals = res_approvals.results[0].data.requested_approvals
        }


        // We have the transaction data, now get approvals
        // Get threshold
        output.threshold = await this.getTrxThreshold(output.trx)


        // console.log(proposer, proposal_name, output)

        // Get the current state by getting cancel/exec/clean transactions
        const closing_query = {
            'block_num':{$gt:block_num},
            'action.account':'dacmultisigs',
            'action.name':{$in:['cancelled', 'executed', 'clean']},
            'action.data.proposal_name':proposal_name,
            'action.data.proposer':proposer
        }
        const closing_actions = await coll_actions.find(closing_query).sort({block_num:1})

        const ca = await closing_actions.next()
        if (ca){
            switch (ca.action.name) {
                case 'cancelled':
                    output.status = MultisigProposalsHandler.STATUS_CANCELLED
                    break
                case 'executed':
                    output.status = MultisigProposalsHandler.STATUS_EXECUTED
                    break
                case 'clean':
                    output.status = MultisigProposalsHandler.STATUS_EXPIRED
                    break
            }
        }
        else {
            output.status = MultisigProposalsHandler.STATUS_OPEN
        }

        // Get the latest provided approvals
        let end_block = 0
        if (ca){
            end_block = ca.block_num
        }
        const query_provided = {code:'eosiomsigold', scope:proposer, table:'approvals', data_query}
        if (end_block){
            query_provided.block_num = end_block
        }

        const provided = await eosTableAtBlock(query_provided)
        if (provided.count){
            // console.log(provided.results[0].data.provided_approvals)
            output.provided_approvals = provided.results[0].data.provided_approvals
        }



        console.log(`Inserting ${proposer}:${proposal_name}:${output.trxid}`)
        return await coll.insertOne(output)

    }

    async action(doc){
        if (doc.action.account == 'dacmultisigs'){
            this.recalcMsigs(doc)
        }
    }
}


MultisigProposalsHandler.STATUS_OPEN = 0
MultisigProposalsHandler.STATUS_CANCELLED = 1
MultisigProposalsHandler.STATUS_EXECUTED = 2
MultisigProposalsHandler.STATUS_EXPIRED = 3

module.exports = new MultisigProposalsHandler()