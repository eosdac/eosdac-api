const transfersSchema = {
	description: 'Transfers',
	summary: 'Transfers for the token of the current DAC',
	tags: ['v1'],
	querystring: {},
};

module.exports = { GET: transfersSchema };
