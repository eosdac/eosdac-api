import { inject, injectable, Result } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryControllerOutput } from '../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryInput } from './models/candidates-voters-history.input';
import { GetCandidatesVotersHistoryUseCase } from './use-cases/get-candidates-voters-history.use-case';
import { CountVotersHistoryUseCase } from './use-cases/count-voters-history.use-case';
import { GetVotingPowerUseCase } from './use-cases/get-voting-power.use-case';

/*imports*/

/**
 * @class
 * 
 * 
 */
@injectable()
export class CandidatesVotersHistoryController {
  public static Token = 'VOTERS_HISTORY_CONTROLLER';

  constructor(
    @inject(GetCandidatesVotersHistoryUseCase.Token)
    private getCandidatesVotersHistoryUseCase: GetCandidatesVotersHistoryUseCase,

    @inject(GetVotingPowerUseCase.Token)
    private getVotingPowerUseCase: GetVotingPowerUseCase,

    @inject(CountVotersHistoryUseCase.Token)
    private countVotersHistoryUseCase: CountVotersHistoryUseCase
    /*injections*/
  ) { }

  /*methods*/

  /**
   * 
   * @returns {Promise<Result<CandidatesVotersHistoryControllerOutput, Error>>}
   */
  public async candidatesVotersHistory(input: CandidatesVotersHistoryInput): Promise<Result<CandidatesVotersHistoryControllerOutput, Error>> {
    const output: CandidatesVotersHistoryControllerOutput = {
      results: null,
      total: 0,
    }

    // Fetch voters history
    const getCandVotersHistoryRes = await this.getCandidatesVotersHistoryUseCase.execute(input);
    if (getCandVotersHistoryRes.isFailure) {
      return Result.withFailure(getCandVotersHistoryRes.failure)
    }
    output.results = getCandVotersHistoryRes.content;

    // Fetch voting power of each voter
    const resultsWithVotingPower = await output.results.map(async item => {
      const votingPowerRes = await this.getVotingPowerUseCase.execute(item);
      if (!votingPowerRes.isFailure) {
        return {
          ...item,
          votingPower: votingPowerRes.content,
        }
      }

      return item;
    })
    output.results = await Promise.all(resultsWithVotingPower)

    // Fetch total count
    const countRes = await this.countVotersHistoryUseCase.execute(input);
    if (countRes.isFailure) {
      return Result.withFailure(countRes.failure)
    }
    output.total = countRes.content;

    return Result.withContent(output)
  }
}
