module.exports.profileResponse = {
	results: [
		{
			account: 'suzqu.wam',
			block_num: 105578904,
			member_type: 0,
			profile: {
				description: 'I am squanching in here',
				familyName: 'Squanch',
				givenName: 'Squanchy',
				image:
					'https://vignette1.wikia.nocookie.net/rickandmorty/images/5/56/S2e10_squanchy_close.png/revision/latest?cb=20160923052032',
			},
		},
	],
	count: 1,
};

module.exports.emptyProfile = {
	results: [
		{
			account: 'dummy',
			block_num: 0,
			member_type: 0,
			profile: {
				description: '',
				email: '',
				familyName: '',
				gender: '',
				givenName: '',
				image: '',
				sameAs: [],
				timezone: '0',
				url: '',
			},
		},
	],
	count: 0,
};
