const getAllTableRows = require("./connections/rpc");

const getMemberTerms = async (logger, api, dacId, limit = 1) => {
  try {
    const query = {
      code: 'token.worlds',
      scope: dacId,
      table: 'memberterms',
      limit,
      reverse: true,
    }

    const result = await api.rpc.get_table_rows(query)
    return result.rows[0] ?? null
  } catch (error) {
    logger.error(`Cannot fetch member terms`, error);
    return null;
  }
};

const getSignedMemberTerms = async (logger, api, dacId, accounts) => {
  const result = new Map();
    try {
      const rows = await getAllTableRows(api, 'token.worlds', dacId, 'members', 'sender')
      for (const account of accounts) {
        const row = rows.find(row => row.sender === account);
        result.set(account, row || { agreedtermsversion: 1, sender: account });
      }
    } catch (error) {
      logger.error(`Cannot fetch signed member terms`, error);
    }
  return result;
};

module.exports = { getMemberTerms, getSignedMemberTerms }
