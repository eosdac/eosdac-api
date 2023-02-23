export const votingHistoryEmptyResponse = { results: [], count: 0 };

export const votingHistorySuccessResponse = {
    results: [
        {
            dacId: 'nerix',
            voter: '.w2fo.wam',
            voteTimestamp: '2021-02-27T04:18:56.000Z',
            candidate: 'a52qw.wam',
            candidateVotePower: '123',
            action: 'voted'
        },
        {
            dacId: 'nerix',
            voter: '.w2fo.wam',
            voteTimestamp: '2021-02-27T04:18:56.000Z',
            candidate: 'b52qw.wam',
            candidateVotePower: '0',
            action: 'voted'
        }
    ],
    count: 2
};

export const votingHistorySkipResponse = {
    results: [
        {
            dacId: 'nerix',
            voter: '.w2fo.wam',
            voteTimestamp: '2021-02-27T04:18:56.000Z',
            candidate: 'b52qw.wam',
            candidateVotePower: '0',
            action: 'voted'
        }
    ],
    count: 1
};

export const votingHistoryLimitResponse = {
    results: [
        {
            dacId: 'nerix',
            voter: '.w2fo.wam',
            voteTimestamp: '2021-02-27T04:18:56.000Z',
            candidate: 'a52qw.wam',
            candidateVotePower: '123',
            action: 'voted'
        }
    ],
    count: 1
};

export const missingDacIdErrorResponse = {
    message: 'bad request',
    errors: ["/query must have required property 'dacId'"]
};

export const missingVoterErrorResponse = {
    message: 'bad request',
    errors: ["/query must have required property 'voter'"]
};
