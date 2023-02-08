export const candidatesVotingHistoryEmptyResponse = { results: [], total: 0 };

export const candidatesVotingHistorySuccessResponse = {
    results: [
        {
            voter: '.w2fo.wam',
            votingPower: '4976640000',
            action: 'votecust',
            candidate: 'a52qw.wam',
            voteTimestamp: '2021-02-27T04:18:56.000Z',
            transactionId: '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666C'
        },
        {
            voter: 'tl2aw.wam',
            votingPower: '65555555',
            action: 'votecust',
            candidate: 'a52qw.wam',
            voteTimestamp: '2021-02-27T04:18:55.000Z',
            transactionId: '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666C'
        }
    ],
    total: 2
};




export const candidatesVotingHistorySkipResponse = {
    results: [
        {
            voter: 'tl2aw.wam',
            votingPower: '65555555',
            action: 'votecust',
            candidate: 'a52qw.wam',
            voteTimestamp: '2021-02-27T04:18:55.000Z',
            transactionId: '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666C'
        }
    ],
    total: 2
};

export const candidatesVotingHistoryLimitResponse = {
    results: [
        {
            voter: '.w2fo.wam',
            votingPower: '4976640000',
            action: 'votecust',
            candidate: 'a52qw.wam',
            voteTimestamp: '2021-02-27T04:18:56.000Z',
            transactionId: '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666C'
        }
    ],
    total: 2
};
