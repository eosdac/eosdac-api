import 'reflect-metadata';

import { injectable, Repository, Result } from '@alien-worlds/api-core';

import { State } from '../entities/state';
import { StateDocument } from '../../data/dtos/state.dto';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class StateRepository extends Repository<State, StateDocument>{
  public static Token = 'STATE_REPOSITORY';

  /*abstract-methods*/
  public abstract getCurrentBlock(): Promise<Result<State>>;
}
