import { injectable } from 'inversify';
import { Repository } from '@alien-worlds/api-core';
import { VoteWeight } from '../entities/vote-weight';
import { VoteWeightDocument } from '../../data/dtos/weights.dto';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class VotingWeightRepository extends Repository<
  VoteWeight,
  VoteWeightDocument
> {
  public static Token = 'VOTING_WEIGHT_REPOSITORY';
}
