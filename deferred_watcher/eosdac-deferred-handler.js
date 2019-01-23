const {Api, JsonRpc, Serialize} = require('eosjs')
const {TextDecoder, TextEncoder} = require('text-encoding')
const JsSignatureProvider = require('eosjs/dist/eosjs-jssig')
const fetch = require('node-fetch')
const crypto = require('crypto')

function convertUint8ArrayToBinaryString(u8Array) {
    var i, len = u8Array.length, b_str = "";
    for (i=0; i<len; i++) {
        b_str += String.fromCharCode(u8Array[i]);
    }
    return b_str;
}

class DeltaHandler {
    constructor({config, wsclient}) {
        this.config = config
        this.wsclient = wsclient

        const rpc = new JsonRpc(this.config.eos.endpoint, {fetch});

        const privkey = '5KkVnP742xubajqLY89xhQLmm51yFgtnevCabQYRp8upxdqGRHL'

        const signatureProvider = new JsSignatureProvider.default([privkey]);
        console.log(signatureProvider)

        this.api = new Api({
            rpc,
            signatureProvider,
            chainId: this.config.chainId,
            textDecoder: new TextDecoder(),
            textEncoder: new TextEncoder(),
        });
    }

    async getTableType (code, table){
        const contract = await this.api.getContract(code)
        const abi = await this.api.getAbi(code)

        // console.log(abi)

        let this_table, type
        for (let t of abi.tables) {
            if (t.name == table) {
                this_table = t
                break
            }
        }

        if (this_table) {
            type = this_table.type
        } else {
            console.error(`Could not find table "${table}" in the abi`)
            return
        }

        return contract.types.get(type)
    }

    queueDelta(block_num, deltas) {
    }

    async processDelta(block_num, deltas, types) {

        for (const delta of deltas) {
            switch (delta[0]) {
                case 'table_delta_v0':
                    if (delta[1].name == 'generated_transaction') {
                        // console.log(delta[1]);
                        // return

                        for (const row of delta[1].rows) {
                            const type = types.get(delta[1].name)
                            const data_sb = new Serialize.SerialBuffer({
                                textEncoder: new TextEncoder,
                                textDecoder: new TextDecoder,
                                array: row.data
                            })
                            const data = type.deserialize(data_sb)


                            if (this.interested(data[1].sender) || (data[1].sender === '.............' && this.interested(data[1].payer))){
                                // console.log(row)
                                // console.log(data[1].sender_id)
                                const actor = (data[1].sender === '.............')?data[1].payer:data[1].sender;

                                const packed = Serialize.hexToUint8Array(data[1].packed_trx)
                                const type_trx = types.get('transaction')
                                const sb_trx = new Serialize.SerialBuffer({
                                    textEncoder: new TextEncoder,
                                    textDecoder: new TextDecoder,
                                    array: packed
                                })
                                const data_trx = type_trx.deserialize(sb_trx)
                                delete data_trx.max_cpu_usage_ms
                                delete data_trx.max_net_usage_words
                                delete data_trx.ref_block_num
                                delete data_trx.ref_block_prefix
                                delete data_trx.context_free_actions
                                delete data_trx.transaction_extensions

                                var trx_id = crypto.createHash('sha256').update(packed).digest('hex');

                                data_trx.actions = await this.api.deserializeActions(data_trx.actions)

                                const store_data = {
                                    present:row.present,
                                    trx_id,
                                    block_num,
                                    trx:data_trx,
                                    sender:data[1].sender,
                                    payer:data[1].payer,
                                    sender_id:data[1].sender_id
                                }

                                console.log("Generated transaction", store_data, store_data.trx.actions, trx_id)

                                if (this.wsclient){
                                    this.wsclient.send(JSON.stringify(store_data))
                                }
                                else {
                                    if (store_data.present){
                                        store_data.trx.actions.forEach((act) => {
                                            if (act.name == 'transfer'){
                                                console.log(`Agent detected transfer of ${act.data.quantity} to ${act.data.to} with sender ${store_data.sender} and ID ${store_data.sender_id}`)

                                                const transfer_data = act.data
                                                const whitelist = ["evilproducer"]

                                                if (!whitelist.includes(transfer_data.to)){
                                                    console.log(`<b style="color:red">Transfer failed whitelist checks</b>`)
                                                    console.log(`Attempting to cancel deferred transaction with SenderID ${store_data.sender_id}, trx id : ${store_data.trx_id}`)

                                                    this.cancelTx({'actor':actor, 'permission':'active'}, store_data.trx_id)
                                                }
                                                else {
                                                    console.log(`<b style="color:green">Transfer to a whitelisted address at ${transfer_data.to}</b>`)
                                                }
                                            }
                                            else {
                                                // dont allow any other transactions
                                                this.cancelTx({'actor':actor, 'permission':'active'}, store_data.trx_id)
                                            }
                                        })
                                    }
                                }

                            }
                        }
                    }
                    break;
            }
        }
    }

    async cancelTx(permissions, trx_id){
        console.log('cancel!', permissions, trx_id)

        try {

            const result = await this.api.transact({
                actions: [{
                    account: 'guardianbot1',
                    name: 'cancel',
                    authorization: [{actor:permissions.actor, permission:'cancel'}],
                    data: {
                        canceling_auth: permissions,
                        trx_id: trx_id
                    },
                }]
              }, {
                blocksBehind: 3,
                expireSeconds: 30
            });
            console.log("result", result)
        }
        catch (e){
            console.error(e)
        }
    }

    interested(account, name) {
        if (this.config.eos.contracts.includes(account)) {
            return true
        }

        return false;
    }
}
module.exports = {DeltaHandler}