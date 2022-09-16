export const proposalsEmptyResponse = { results: [], count: 0 };

export const proposalsNegativeSkipParamResponse = { results: [], count: 5 };

export const allProposalsList = {
	results: [
		{ dac_id: 'eyeke', status: 0, approve_voted: 'eyeke.worlds' },
		{ dac_id: 'eyeke', status: 1 },
		{ dac_id: 'eyeke', status: 1, approve_voted: 'eyeke.worlds' },
		{ dac_id: 'eyeke', status: 1, finalize_voted: 'eyeke.worlds' },
		{ dac_id: 'eyeke', status: 2, finalize_voted: 'eyeke.worlds' },
	],
	count: 5,
};

export const status0ProposalsList = {
	results: [{ dac_id: 'eyeke', status: 0, approve_voted: 'eyeke.worlds' }],
	count: 1,
};

export const status0_1_ProposalsList = {
	results: [
		{ dac_id: 'eyeke', status: 0, approve_voted: 'eyeke.worlds' },
		{ dac_id: 'eyeke', status: 1 },
		{ dac_id: 'eyeke', status: 1, approve_voted: 'eyeke.worlds' },
		{ dac_id: 'eyeke', status: 1, finalize_voted: 'eyeke.worlds' },
	],
	count: 4,
};
