const null_profile = {
	description: '',
	email: '',
	familyName: '',
	gender: '',
	givenName: '',
	image: '',
	sameAs: [],
	timezone: '0',
	url: '',
};

async function getMemberType(account, dacName, db) {
	let member_type = 0;

	const coll = db.collection('memberstats');
	const res = await coll.findOne({ account, dac_id: dacName });
	if (res) {
		member_type = res.member_type;
	}

	return member_type;
}

async function getProfiles(db, dac_config, dacId, accounts, legacy = false) {
	const collection = db.collection('actions');
	const cust_contract = dac_config.accounts.get(2);

	const query = {
		'action.account': cust_contract,
		'action.name': 'stprofile',
		'action.data.dac_id': dacId,
		'action.data.cand': { $in: accounts },
	};

	if (legacy) {
		query['action.data.dac_id'] = { $in: [dacId, null] };
		query['action.name'] = { $in: ['stprofileuns', 'stprofile'] };
	}

	const pipeline = [
		{ $match: query },
		{ $sort: { block_num: -1 } },
		{
			$group: {
				_id: { cand: '$action.data.cand' },
				block_num: { $first: '$block_num' },
				profile: { $first: '$action.data.profile' },
				account: { $first: '$action.data.cand' },
			},
		},
		{ $sort: { block_num: -1 } },
		{
			$facet: {
				results: [{ $match: {} }],
				count: [{ $count: 'count' }],
			},
		},
	];

	const res = await collection.aggregate(pipeline);

	const found_accounts = [];
	const result = await res.next();
	result.results = result.results.map(row => {
		// console.log(row.profile)
		if (typeof row.profile === 'string') {
			try {
				row.profile = JSON.parse(row.profile);
			} catch (e) {
				const desc = row.profile;
				row.profile = null_profile;
				row.profile.description = desc;
			}
		}
		delete row._id;

		found_accounts.push(row.account);

		return row;
	});

	const missing_accounts = [];
	accounts.forEach(account_name => {
		if (!found_accounts.includes(account_name)) {
			missing_accounts.push(account_name);
		}
	});

	accounts.forEach(account => {
		if (missing_accounts.includes(account)) {
			result.results.push({
				account,
				block_num: 0,
				profile: null_profile,
			});
		}
	});

	// Calculate member type
	for (let r = 0; r < result.results.length; r++) {
		const data = result.results[r];
		data.member_type = await getMemberType(data.account, dacId, db);

		// console.log(data);
		result.results[r] = data;
		// console.log(data);
	}

	if (result.count.length) {
		result.count = result.results.length;
	}

	return result;
}

module.exports = { getProfiles };
