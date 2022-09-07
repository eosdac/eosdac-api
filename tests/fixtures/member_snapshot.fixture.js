module.exports.successResponse = {
    results: [
        {
            account: "suzqu.wam",
            balance: [
                "0.0000",
                "4,TESTA"
            ],
            terms: 1,
            zero_balance: true,
            voter: false
        }
    ],
    count: 1
}

module.exports.noSymbolSuccessResponse = {
    results: [
        {
            account: "suzqu.wam",
            balance: [
                "0.0000",
                "EYE"
            ],
            terms: 1,
            zero_balance: true,
            voter: false
        }
    ],
    count: 1
}

module.exports.emptyResponse = {
    results: [],
    count: 0,
}