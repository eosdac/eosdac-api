
import { inject, injectable } from 'inversify';
import { Result, UseCase } from '@alien-worlds/api-core';
import { FlagRepository } from '@alien-worlds/eosdac-api-common';
import { IsProfileFlaggedUseCaseInput, IsProfileFlaggedUseCaseOutput } from '../../data/dtos/profile.dto';
import { IsProfileFlaggedQueryModel } from '../models/is-profile-flagged.query-model';


/*imports*/
/**
 * @class
 */
@injectable()
export class IsProfileFlaggedUseCase implements UseCase<IsProfileFlaggedUseCaseOutput[]> {
  public static Token = 'IS_PROFILE_FLAGGED_USE_CASE';

  constructor(/*injections*/
    @inject(FlagRepository.Token)
    private flagRepository: FlagRepository
  ) { }

  /**
   * @async
   * @returns {Promise<Result<IsProfileFlaggedUseCaseOutput[]>>}
   */
  public async execute(input: IsProfileFlaggedUseCaseInput): Promise<Result<IsProfileFlaggedUseCaseOutput[]>> {
    let output: IsProfileFlaggedUseCaseOutput[]
    if (input.accounts.length > 0) {
      const queryModel = IsProfileFlaggedQueryModel.create({
        dacId: input.dacId,
        accounts: input.accounts,
      })

      const result = await this.flagRepository.aggregate(queryModel);
      if (result.isFailure) {
        return Result.withFailure(result.failure)
      }

      output = result.content.map(doc => {
        return {
          account: doc.candidate,
          block: doc.block,
        }
      })
    }

    return Result.withContent(output)
  }

  /*methods*/
}

