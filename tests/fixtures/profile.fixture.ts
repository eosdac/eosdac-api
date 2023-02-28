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

export const multipleProfilesResponse = {
	"results": [
		{
			"block_num": "209788070",
			"account": "mgaqy.wam",
			"profile": {
				"description": "Together We Grow \n\nThe Goiter is the longest standing political party in all of Alien Worlds. We predate everyone and stand fast to all commitments. \n\nDon't worry, you can trust us....\n\nt.me/thegoiter\nhttps://twitter.com/nftstan",
				"givenName": "The Goiter",
				"image": "https://gateway.pinata.cloud/ipfs/Qmci9dg78RySNm3dbQuSynd7PuEbiaUFdaWwQV7WTZDAxu"
			}
		},
		{
			"block_num": "105578904",
			"account": "suzqu.wam",
			"profile": {
				"description": "I am squanching in here",
				"familyName": "Squanch",
				"givenName": "Squanchy",
				"image": "https://vignette1.wikia.nocookie.net/rickandmorty/images/5/56/S2e10_squanchy_close.png/revision/latest?cb=20160923052032"
			}
		}
	],
	"count": 2
};

export const profileNotFound = {
	error: "profile not found",
};

export const errorQueryParamAccountMissing = {
	message: 'bad request',
	errors: ["/query must have required property 'account'"]
};

export const badDacIdResponse = {
	results: [],
	count: 0
};
