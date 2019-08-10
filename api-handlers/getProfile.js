const {getProfileSchema} = require('../schemas');
const {NotFound} = require('http-errors');

const null_profile = {
    description: "",
    email: "",
    familyName: "",
    gender: "",
    givenName: "",
    image: "",
    sameAs: [],
    timezone: "0",
    url: ""
};


async function getProfile(fastify, request) {
    const account = request.query.account;
    const accounts = account.split(',');

    const dac_config = await request.dac_config();

    const db = fastify.mongo.db;
    const collection = db.collection('actions');

    const cust_contract = dac_config.accounts.get(2);
    const dac_id = request.dac();

    const query = {"action.account": cust_contract, "action.name": "stprofileuns", "action.data.dac_id":dac_id, "action.data.cand": {$in: accounts}};

    if (fastify.config.eos.legacyDacs && fastify.config.eos.legacyDacs.length && fastify.config.eos.legacyDacs.includes(dac_id)){
        fastify.log.info(`Got legacy dac ${dac_id}`, {dac_id});
        query['action.data.dac_id'] = {$in: [dac_id, null]};
        query['action.name'] = {$in: ['stprofileuns', 'stprofile']};
    }

    const pipeline = [
        {$match: query},
        {'$sort': {block_num: -1}},
        {
            '$group': {
                _id: {cand: "$action.data.cand"},
                block_num: {'$first': "$block_num"},
                profile: {'$first': "$action.data.profile"},
                account: {'$first': "$action.data.cand"}
            }
        },
        {'$sort': {block_num: -1}},
        {
            '$facet': {
                results: [{$match: {}}],
                count: [{'$count': 'count'}]
            }
        }

    ];

    const res = await collection.aggregate(pipeline);

    const found_accounts = [];
    const result = await res.next();
    result.results = result.results.map((row) => {
        // console.log(row.profile)
        if (typeof row.profile === 'string') {
            row.profile = JSON.parse(row.profile);
        }
        delete row._id;

        found_accounts.push(row.account);

        return row
    });

    const missing_accounts = [];
    accounts.forEach((account_name) => {
        if (!found_accounts.includes(account_name)){
            missing_accounts.push(account_name);
        }
    });

    accounts.forEach((account) => {
        if (missing_accounts.includes(account)){
            result.results.push({
                account,
                block_num: 0,
                profile: null_profile
            });
        }
    });

    // console.log(missing_accounts)

    if (result.count.length) {
        result.count = result.results.length
    }


    return result
}


module.exports = function (fastify, opts, next) {
    fastify.get('/profile', {
        schema: getProfileSchema.GET
    }, async (request, reply) => {
        const profile = await getProfile(fastify, request);
        if (profile) {
            reply.send(profile);
        } else {
            throw new NotFound('Account profile not found')
        }
    });
    next()
};
