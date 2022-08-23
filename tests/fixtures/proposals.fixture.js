module.exports.proposalsEmptyResponse = { results: [], count: 0 }

module.exports.proposalsNegativeSkipParamResponse = { results: [], count: 7 }

module.exports.allProposalsList = {
    results: [
        { dac_id: 'eyeke', status: 0, approve_voted: 'dao.worlds' },
        { dac_id: 'eyeke', status: 0, approve_voted: 'eyeke.worlds' },
        { dac_id: 'eyeke', status: 1 },
        { dac_id: 'eyeke', status: 1, approve_voted: 'eyeke.worlds' },
        { dac_id: 'eyeke', status: 1, finalize_voted: 'eyeke.worlds' },
        { dac_id: 'eyeke', status: 2, finalize_voted: 'dao.worlds' },
        { dac_id: 'eyeke', status: 2, finalize_voted: 'eyeke.worlds' }
    ],
    count: 7
}

module.exports.status0ProposalsList = {
    results: [
        { dac_id: 'eyeke', status: 0, approve_voted: 'dao.worlds' },
        { dac_id: 'eyeke', status: 0, approve_voted: 'eyeke.worlds' },
    ],
    count: 2
}

module.exports.status0_1_ProposalsList = {
    results: [
        { dac_id: 'eyeke', status: 0, approve_voted: 'dao.worlds' },
        { dac_id: 'eyeke', status: 0, approve_voted: 'eyeke.worlds' },
        { dac_id: 'eyeke', status: 1 },
        { dac_id: 'eyeke', status: 1, approve_voted: 'eyeke.worlds' },
        { dac_id: 'eyeke', status: 1, finalize_voted: 'eyeke.worlds' }
    ],
    count: 5
}
