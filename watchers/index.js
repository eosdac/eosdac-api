const multisigProposals = require('./multisig_proposals');
const workerProposals = require('./worker_proposals');
const votes = require('./votes');
const newPeriod = require('./new_period');

module.exports = [
    multisigProposals,
    workerProposals,
    votes,
    newPeriod
];
