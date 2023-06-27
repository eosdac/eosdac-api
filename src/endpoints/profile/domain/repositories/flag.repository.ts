import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import { injectable, RepositoryImpl } from '@alien-worlds/api-core';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class FlagRepository extends RepositoryImpl<
  DaoWorldsCommon.Actions.Entities.Flagcandprof,
  DaoWorldsCommon.Actions.Types.FlagcandprofMongoModel
> {
  public static Token = 'FLAG_REPOSITORY';
}
