const candidatesSchema = {
    description: 'Get candidates',
    summary: 'Fetch current DAC candidates',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "limit": {
                description: 'Limit result count',
                type: 'integer'
            },
            "skip": {
                description: 'Skip number of results',
                type: 'integer'
            }
        },
        required: []
    },
        response: {
            200: {
                type: "object",
                properties: {
                    "results": {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                "candidate_name" : {
                                    type: "string"
                                },
                                "custodian_end_time_stamp" : {
                                    type: ["string", "null"]
                                },
                                "is_active" : {
                                    type: "boolean"
                                },
                                "is_custodian" : {
                                    type: "boolean"
                                },
                                "locked_tokens" : {
                                    type: "string"
                                },
                                "requestedpay" : {
                                    type: "string"
                                },
                                "total_votes" : {
                                    type: "string"
                                }
                            }
                        }
                    },
                    "count": {
                        type: "integer"
                    }
                }
            }
        }
};

module.exports = {GET: candidatesSchema};