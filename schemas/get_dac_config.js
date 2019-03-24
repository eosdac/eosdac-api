const getDacConfigSchema = {
    description: 'Fetch DAC config',
    summary: 'Fetch current DAC configuration',
    tags: ['v1'],
    querystring: {},
    response: {
        200: {
            type: 'object',
            properties: {
                "auth_threshold_high": {
                    type: "integer"
                },
                "auth_threshold_med": {
                    type: "integer"
                },
                "auth_threshold_low": {
                    type: "integer"
                },
                "authaccount": {
                    type: "string"
                },
                "initial_vote_quorum_percent": {
                    type: "integer"
                },
                "lockup_release_time_delay": {
                    type: "integer"
                },
                "lockupasset": {
                    type: "string"
                },
                "maxvotes": {
                    type: "integer"
                },
                "numelected": {
                    type: "integer"
                },
                "periodlength": {
                    type: "integer"
                },
                "requested_pay_max": {
                    type: "string"
                },
                "serviceprovider": {
                    type: "string"
                },
                "should_pay_via_service_provider": {
                    type: "integer"
                },
                "tokenholder": {
                    type: "string"
                },
                "vote_quorum_percent": {
                    type: "integer"
                }
            }
        }
    }
};

module.exports = {GET: getDacConfigSchema};