const { getProfiles } = require("./profile-helper");

const getCandidates = async (logger, api, dacId, limit = 100) => {
  try {  
    const query = {
        scope: dacId.toLowerCase(),
        code: 'dao.worlds',
        table: 'candidates',
        limit,
      }

      const result = await api.rpc.get_table_rows(query)
      return result.rows;
  } catch (error) {
    logger.error(`Cannot fetch planet candidates`, error);
    return [];
  }
}

const getVotedCandidates = async (logger, api, dacId, walletId) => {
  try {  
    const query = {
        scope: dacId.toLowerCase(),
        code: 'dao.worlds',
        table: 'votes',
        lower_bound: walletId,
        upper_bound: walletId,
        limit: 1,
    }

      const result = await api.rpc.get_table_rows(query);
      return (result.rows.length) ? result.rows[0].candidates : [];
  } catch (error) {
    logger.error(`Cannot fetch voted candidates`, error);
    return [];
  }
}

const getCandidatesProfiles = async (logger, db, dacConfig, dacId, accounts) => {
  try {  
    return getProfiles(db, dacConfig, dacId, accounts);
  } catch (error) {
    logger.error(`Cannot fetch candidates profiles`, error);
    return { count: 0, results: [] };
  }
}

const buildCandidateFullProfile = (
  dacId,
  candidate,
  profiles,
  terms,
  signedMemberTerms,
  votedCandidates
) => {
  const {
    candidate_name: walletId,
    requestedpay,
    total_vote_power,
    rank,
    gap_filler: gapFiller,
    is_active: isActive,
    number_voters: totalVotes,
    avg_vote_time_stamp,
  } = candidate;
  const profile = profiles.find(item => item.account === walletId);

  const { agreedtermsversion: agreedTermVersion } = signedMemberTerms;

  const voteDecay = new Date(avg_vote_time_stamp).getFullYear() > 1970
    ? Math.ceil((new Date().getTime() - new Date(avg_vote_time_stamp).getTime()) / (3600 * 24 * 1000))
    : null;
  const votePower = +total_vote_power/10000

  return {
    walletId,
    requestedpay,
    votePower,
    rank,
    gapFiller,
    isActive,
    totalVotes,
    voteDecay,
    ...profile?.profile,
    agreedTermVersion,
    currentPlanetMemberTermsSignedValid: agreedTermVersion === terms.version,
    isFlagged: profile?.error,
    isSelected: false,
    isVoted: votedCandidates.includes(walletId),
    isVoteAdded: false,
    planetName: dacId,
  }
}

module.exports = { getCandidates, getVotedCandidates, getCandidatesProfiles, buildCandidateFullProfile }
