const getProposalsSchema = {
    description: 'Fetch worker proposals',
    summary: 'Fetch current worker proposals',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "state": {
                description: 'Filter by current state',
                type: 'integer'
            },
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
            type: 'object',
            properties: {
                "results": {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            "arbitrator": {
                                description: "",
                                type: "string"
                            },
                            "content_hash": {
                                description: "",
                                type: "string"
                            },
                            "key": {
                                description: "",
                                type: "integer"
                            },
                            "pay_amount": {
                                description: "",
                                type: "object",
                                properties: {
                                    "contract": {
                                        description: "",
                                        type: "string"
                                    },
                                    "quantity": {
                                        description: "",
                                        type: "string"
                                    }
                                }
                            },
                            "proposer": {
                                description: "",
                                type: "string"
                            },
                            "state": {
                                description: "",
                                type: "integer"
                            },
                            "summary": {
                                description: "Summary of proposal",
                                type: "string"
                            },
                            "description": {
                                description: "Longer description of proposal",
                                type: "string"
                            },
                            "votes": {
                                description: "Votes",
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        "comment_hash": {
                                            description: "Summary of proposal",
                                            type: "string"
                                        },
                                        "proposal_id": {
                                            description: "Summary of proposal",
                                            type: "string"
                                        },
                                        "vote": {
                                            description: "Summary of proposal",
                                            type: "string"
                                        },
                                        "vote_id": {
                                            description: "Summary of proposal",
                                            type: "string"
                                        },
                                        "voter": {
                                            description: "Summary of proposal",
                                            type: "string"
                                        }
                                    }
                                }
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

module.exports = {GET: getProposalsSchema};