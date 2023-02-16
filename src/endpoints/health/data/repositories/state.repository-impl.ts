import {
  Failure,
  RepositoryImpl,
  Result,
  UpdateStatus,
} from '@alien-worlds/api-core';

import { CurrentBlockNotFoundError } from '../../domain/errors/current-block-not-found.error';
import { State } from '../../domain/entities/state';
import { StateDocument } from '../dtos/state.dto';
import { StateMapper } from '../mappers/state.mapper';
import { StateMongoSource } from '../data-sources/state.mongo.source';
import { StateRepository } from '../../domain/repositories/state.repository';

/*imports*/
/**
 * @class
 */
export class StateRepositoryImpl
  extends RepositoryImpl<State, StateDocument>
  implements StateRepository {
  /**
   * @constructor
   * @param {StateMongoSource} stateMongoSource
   */
  constructor(private stateMongoSource: StateMongoSource, mapper: StateMapper) {
    super(stateMongoSource, mapper);
  }

  /*methods*/

  /**
   * Get current block
   *
   * @async
   * @param
   * @returns {Promise<Result<State>>}
   */
  public async getCurrentBlock(): Promise<Result<State>> {
    try {
      const dto = await this.stateMongoSource.getCurrentBlock();

      return dto
        ? Result.withContent(State.fromDto(dto))
        : Result.withFailure(
          Failure.fromError(new CurrentBlockNotFoundError())
        );
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   *
   * @async
   * @returns {Promise<Result<State>}
   */

  public async update(
    state: State
  ): Promise<Result<UpdateStatus.Success | UpdateStatus.Failure>> {
    try {
      const dto = state.toDto();
      await this.stateMongoSource.update(
        { value: dto.value },
        { where: { name: 'current_block' } }
      );
      return Result.withContent(UpdateStatus.Success);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
