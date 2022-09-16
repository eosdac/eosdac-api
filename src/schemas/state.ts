const stateSchema = {
	description: 'Get State',
	summary: 'Get current state variables',
	tags: ['v1'],
	querystring: {},
};

module.exports = { GET: stateSchema };
