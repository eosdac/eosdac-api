const getCustodians = async (logger, api, dacId, limit) => {
  try {  
    const query = {
        scope: dacId.toLowerCase(),
        code: 'dao.worlds',
        table: 'custodians1',
      }

      if (limit) {
        query.limit = limit;
      }

      const result = await api.rpc.get_table_rows(query)
      return result.rows;
  } catch (error) {
    logger.error(`Cannot fetch planet custodians`, error);
    return [];
  }
}

const buildCustodianFullProfile = (
  dacId,
  custodian,
  profiles,
  terms,
  signedMemberTerms,
) => {
  const {
    cust_name: walletId,
    requestedpay,
    total_vote_power,
  } = custodian;
  const profile = profiles.find(item => item.account === walletId);
  const { agreedtermsversion: agreedTermVersion } = signedMemberTerms;
  const votePower = +total_vote_power/10000

  return {
    walletId,
    requestedpay,
    votePower,
    ...profile?.profile,
    agreedTermVersion,
    currentPlanetMemberTermsSignedValid: agreedTermVersion === terms.version,
    isFlagged: profile?.error,
    isSelected: false,
    planetName: dacId,
  }
}

module.exports = { getCustodians, buildCustodianFullProfile }
