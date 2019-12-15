const multisigProposals = require('./multisig_proposals');
const workerProposals = require('./worker_proposals');
const votes = require('./votes');
const newPeriod = require('./new_period');
const memberStatus = require('./member_status');

module.exports = [
    memberStatus,
    multisigProposals,
    workerProposals,
    votes,
    newPeriod
];
