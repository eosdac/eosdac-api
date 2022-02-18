const {memberSnapshotSchema} = require('../schemas');
const {eosTableAtBlock} = require('../eos-table');

const MongoLong = require('mongodb').Long;

async function memberSnapshot(fastify, request) {
    // console.log(request)
    return new Promise(async (resolve, reject) => {
        const db = fastify.mongo.db;
        const dac_config = await request.dac_config();
        // const dac_id = 'eosdac';
        const dac_id = request.dac();

        const contract = request.query.contract || dac_config.symbol.contract;
        const custodian_contract = dac_config.accounts.get(2);
        const symbol = request.query.symbol || dac_config.symbol.symbol.split(',')[1];
        const precision = parseInt(dac_config.symbol.symbol.split(',')[0]);
        const block_num = request.query.block_num || null;
        const sort_col = request.query.sort || 'account';

        fastify.log.info(`Generating snapshot for ${symbol}@${contract} on block ${block_num} with dac_id ${dac_id}`, {dac_id});

        // Get all members and add to a Map
        const limit = 500;
        let skip = 0;
        let has_more = true;

        const members_match = {db, code: contract, scope: dac_id, table: 'members', limit, skip, exclude_scope:true};
        if (block_num) {
            console.log(`BLOCK : ${block_num}`);
            members_match.block_num = block_num;
        }

        const members = new Map;


        while (has_more){
            const members_res = await eosTableAtBlock(members_match);

            members_res.results.forEach((member) => {
                // console.log(member.data);
                const zero_bal = '0.' + '0'.repeat(precision);
                members.set(member.data.sender, {terms: member.data.agreedtermsversion, zero_balance: true, balance: [zero_bal, symbol], voter: false, block_num: member.block_num});
            });
            fastify.log.info(`Members results length ${members_res.count}`, {dac_id});

            if (members_res.count <= limit + members_match.skip){
                console.log(`DO NOT HAVE MORE`);
                has_more = false;
            }
            else {
                has_more = true;
            }

            members_match.skip += limit;
            fastify.log.info(`Skip to member ${members_match.skip}`, {dac_id});
        }


        // Loop through all balances and if they are in the members Map then add balance
        skip = 0;
        has_more = true;
        const balances_match = {db, code: contract, table: 'accounts', limit, skip, scope:{$in:Array.from(members.keys())}};
        if (block_num) {
            balances_match.block_num = {$lte: new MongoLong(block_num)}
        }

        while (has_more){
            const balances_res = await eosTableAtBlock(balances_match);

            balances_res.results.forEach((balance) => {
                // console.log(balance);
                if (members.has(balance.scope)){
                    const member_data = members.get(balance.scope);
                    member_data.balance = balance.data.balance.split(' ');
                    if (parseFloat(member_data.balance[0]) > 0){
                        member_data.zero_balance = false;
                    }
                    members.set(balance.scope, member_data);
                }
                // balances.set(member.data.sender, {terms: member.data.agreedtermsversion, balance: null, block_num: member.block_num});
            });

            fastify.log.info(`${balances_res.count} balances found`, {dac_id});
            if (balances_res.count < limit + balances_match.skip){
                has_more = false;
            }
            else {
                has_more = true;
            }

            balances_match.skip += limit;
            fastify.log.info(`Skip to balance ${balances_match.skip}`, {dac_id});
        }


        // Get all voters
        const voters = new Set;
        skip = 0;
        has_more = true;
        const voter_match = {db, code: custodian_contract, table: 'votes', limit, skip, scope:dac_id};
        if (block_num) {
            voter_match.block_num = {$lte: new MongoLong(block_num)}
        }
        // voter_match.data_query = {voter};

        while (has_more){
            const votes_res = await eosTableAtBlock(voter_match);

            votes_res.results.forEach((voter_row) => {
                if (voter_row.data.candidates.length){
                    voters.add(voter_row.data.voter);
                }
            });

            fastify.log.info(`${votes_res.count} votes found`, {dac_id});
            if (votes_res.count < limit + voter_match.skip){
                has_more = false;
            }
            else {
                has_more = true;
            }

            voter_match.skip += limit;
            fastify.log.info(`Skip to balance ${voter_match.skip}`, {dac_id});
        }

        // console.log(voters);


        // Check if each member is voting
        for (let k of members){
        //     // console.log(k[0]);
            const voter = k[0];
            const voter_data = k[1];
            if (voters.has(voter)){
                voter_data.voter = true;
                members.set(voter, voter_data);
            }
        }




        // Get candidates and add stake
        const candidates_match = {db, code: custodian_contract, scope: dac_id, table: 'candidates', limit:1000};
        if (block_num) {
            candidates_match.block_num = {$lte: new MongoLong(block_num)}
        }
        const candidates_res = await eosTableAtBlock(candidates_match);
        candidates_res.results.forEach((custodian) => {
            // console.log(custodian.data.candidate_name);
            if (members.has(custodian.data.candidate_name)){
                const member_data = members.get(custodian.data.candidate_name);
                const stake = custodian.data.locked_tokens.split(' ');
                if (!member_data.balance){
                    member_data.balance = stake;
                }
                else {
                    member_data.balance[0] = (parseFloat(member_data.balance[0]) + parseFloat(stake[0])).toFixed(precision);
                }

                members.set(custodian.data.candidate_name, member_data);
            }
        });




        // Convert members from Map to array and then sort
        const members_arr = [];
        members.forEach((member_data, account, c) => {
            // console.log(account, member_data, c);
            member_data.account = account;
            members_arr.push(member_data);
        });
        // console.log(members_arr);

        let sorter;
        const balance_sorter = (a, b) => {
            let a_bal = 0, b_bal = 0;
            if (a.balance){
                a_bal = a.balance[0];
            }
            if (b.balance){
                b_bal = b.balance[0];
            }
            return (parseFloat(a_bal) > parseFloat(b_bal)) ? -1 : 1
        };
        const account_sorter = (a, b) => (a[sort_col] < b[sort_col]) ? -1 : 1;
        switch (sort_col) {
            case 'balance':
                sorter = balance_sorter;
                break;
            case 'account':
            default:
                sorter = account_sorter;
                break
        }

        const sorted = members_arr.sort(sorter);

        resolve({results: sorted, count: sorted.length})

    })
}


module.exports = function (fastify, opts, next) {
    fastify.get('/member_snapshot', {
        schema: memberSnapshotSchema.GET
    }, async (request, reply) => {
        reply.send(await memberSnapshot(fastify, request));
    });
    next()
};
