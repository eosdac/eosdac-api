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

const getSignedMemberTerms = async (logger, api, dacId, walletId) => {
    try {
      const query = {
        code: 'token.worlds',
        scope: dacId,
        table: 'members',
        lower_bound: walletId,
        upper_bound: walletId,
        limit: 1,
      }
  
      const result = await api.rpc.get_table_rows(query)
      return result.rows[0] || { agreedtermsversion: 1, sender: walletId };
    } catch (error) {
      logger.error(`Cannot fetch signed member terms`, error);
      return { agreedtermsversion: 1, sender: walletId };
    }
};

module.exports = { getMemberTerms, getSignedMemberTerms }
