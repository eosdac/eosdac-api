export const profileResponse = {
	results: [
		{
			block_num: '105578904',
			account: 'suzqu.wam',
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

export const profileNotFound = {
	error: "profile not found",
};

export const emptyProfile = {
	results: [
		{
			account: 'dummy',
			block_num: 0,
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
