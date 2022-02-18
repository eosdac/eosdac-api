// STATE
db.contract_rows.createIndex({
    "code" : 1,
    "table" : 1
}, {background:true});
db.contract_rows.createIndex({
    "code" : 1,
    "scope" : 1,
    "table" : 1
}, {background:true});
db.contract_rows.createIndex({
    "block_num" : 1,
    "code" : 1,
    "scope" : 1,
    "table" : 1,
    "data_hash" : 1,
    "present" : 1
}, {unique:true, background:true});



// ACTIONS
// global sequence is unique
db.actions.createIndex({
    "global_sequence" : 1
}, {unique:true, background:true});

db.actions.createIndex({
    "action.account" : 1,
    "action.name" : 1
}, {background:true});

// msig actions
db.actions.createIndex({
    "action.account" : 1,
    "action.name" : 1,
    "action.data.proposal_name" : 1,
    "action.data.proposer" : 1
}, {sparse:true, background:true});

db.multisigs.createIndex({
    "proposer" : 1,
    "proposal_name" : 1,
    "trxid" : 1
}, {unique:true, background:true});

db.multisigs.createIndex({
    "status" : 1
}, {background:true});


// profile
db.actions.createIndex({
    "action.account" : 1,
    "action.name" : 1,
    "action.data.cand" : 1
}, {sparse:true, background:true});


// Worker proposals
db.workerproposals.createIndex({
    "status" : 1
}, {background:true});
db.workerproposals.createIndex({
    "status" : 1,
    "proposer": 1
}, {background:true});
db.workerproposals.createIndex({
    "status" : 1,
    "arbitrator": 1
}, {background:true});

