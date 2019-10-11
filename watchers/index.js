const multisigProposals = require('./multisig_proposals');
const workerProposals = require('./worker_proposals');
const newPeriod = require('./new_period');

module.exports = [
    multisigProposals,
    workerProposals,
    newPeriod
];
