export const dacsEmptyResponse = { results: [], count: 0 };

export const dacsSuccessResponse = {
  results: [
    {
      id: '',
      dacId: 'eyeke',
      owner: 'eyeke.dac',
      title: 'Eyeke',
      dacState: 0,
      symbol: { contract: 'token.worlds', code: 'EYE', precision: 4 },
      refs: {
        logoUrl: 'QmW1SeninpNQUMLstTPFTv7tMkRdBZMHBJTgf17Znr1uKK',
        description:
          'Also known as Second Earth or Terra Alterna as it is the nearest, and closest, of all Alien Worlds to Earth. Humans found Eyeke inhabited by a Monastic order of Greys who believe that Eyeke is a spiritual place. Despite initial fears, Trilium mining seems to be tolerated by the Monks at this time.',
        rest: { '12': 'QmUXjmrQ6j2ukCdPjacdQ48MmYo853u4Y5y3kb5b4HBuuF' },
      },
      accounts: {
        auth: 'eyeke.world',
        treasury: 'eyeke.world',
        custodian: 'dao.worlds',
        msigOwned: 'eyeke.dac',
        voteWeight: 'stkvt.worlds',
        activation: 'newperiodctl',
        spendings: 'eyeke.dac',
      },
      dacTreasury: { balance: '10628669.3835 TLM' },
      dacStats: {
        supply: '2192823.6176 EYE',
        maxSupply: '10000000000 EYE',
        issuer: 'federation',
        transferLocked: false,
      },
      dacGlobals: [
        { key: 'auth_threshold_high', value: ['uint8', 3] },
        { key: 'auth_threshold_low', value: ['uint8', 2] },
        { key: 'auth_threshold_mid', value: ['uint8', 3] },
        { key: 'budget_percentage', value: ['uint32', 200] },
        { key: 'initial_vote_quorum_percent', value: ['uint32', 2] },
        {
          key: 'lastclaimbudgettime',
          value: ['time_point_sec', '2023-02-05T17:38:00'],
        },
        {
          key: 'lastperiodtime',
          value: ['time_point_sec', '2023-02-05T12:00:31'],
        },
        { key: 'lockup_release_time_delay', value: ['uint32', 1] },
        {
          key: 'lockupasset',
          value: [
            'extended_asset',
            { quantity: '5000.0000 EYE', contract: 'token.worlds' },
          ],
        },
        { key: 'maxvotes', value: ['uint8', 2] },
        { key: 'met_initial_votes_threshold', value: ['bool', 1] },
        { key: 'number_active_candidates', value: ['uint32', 12] },
        { key: 'numelected', value: ['uint8', 5] },
        { key: 'periodlength', value: ['uint32', 604800] },
        {
          key: 'requested_pay_max',
          value: [
            'extended_asset',
            { quantity: '0.0000 TLM', contract: 'alien.worlds' },
          ],
        },
        {
          key: 'should_pay_via_service_provider',
          value: ['bool', 0],
        },
        {
          key: 'token_supply_theshold',
          value: ['uint64', 100000000],
        },
        {
          key: 'total_votes_on_candidates',
          value: ['int64', '64816332523'],
        },
        {
          key: 'total_weight_of_votes',
          value: ['int64', '13304106126'],
        },
        { key: 'vote_quorum_percent', value: ['uint32', 1] },
      ],
    },
  ],
  count: 1,
};
