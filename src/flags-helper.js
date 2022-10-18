const getAccountFlags = async (db, dacId, accounts) => {
    if (accounts.length > 0) {
        const collection = db.collection('flags');
        const result = await collection.aggregate([
            { $match: { dac_id: dacId, cand: { $in:accounts } } },
            { $sort: { "block_num": -1 } },
            { $group : { 
              _id : { cand: "$cand" },
              block : { $first: "$block" },
            }},
        ]);
  
        const documents = await result.toArray();
        return documents.map(doc => ({account: doc._id.cand, block: doc.block}))
    }
  
    return [];
  }

module.exports = { getAccountFlags }
