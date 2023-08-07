import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { injectable, RepositoryImpl } from '@alien-worlds/aw-core';

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
