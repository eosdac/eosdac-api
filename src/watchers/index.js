const multisigProposals = require('./multisig_proposals');
const workerProposals = require('./worker_proposals');
const votes = require('./votes');
const tokens = require('./tokens');
const referendums = require('./referendums');
const newPeriod = require('./new_period');
const memberStatus = require('./member_status');
const dacdirectory = require('./dacdirectory');
const flagcandprof = require('./flagcandprof');

module.exports = [
    memberStatus,
    multisigProposals,
    workerProposals,
    votes,
    tokens,
    referendums,
    newPeriod,
    dacdirectory,
    flagcandprof
];
