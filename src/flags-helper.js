const getBlockedAccounts = async (db, dacId, accounts) => {
    if (accounts.length > 0) {
        const collection = db.collection('flags');
        const result = await collection.aggregate([
            { $match: { dac_id: dacId, cand: { $in:accounts }, block:true } },
            { $sort: { "_id": -1 } },
            { $group : { 
              _id : { cand: "$cand" },
            }},
        ]);
        
        const documents = await result.toArray();
        return documents.map(doc => doc._id.cand)
    }
    
    return [];
}

module.exports = { getBlockedAccounts }
