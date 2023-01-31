import { Long, parseToBigInt } from '@alien-worlds/api-core';
import { VoteWeightDocument, VoteWeightTableRow } from '../../data/dtos/weights.dto';

/**
 * Represents schema smart contract data
 *
 * @class
 */
export class VoteWeight {
  /**
   * Get Schema smart contract data based on table row.
   *
   * @static
   * @returns {VoteWeight}
   */
  public static fromTableRow(dto: VoteWeightTableRow): VoteWeight {
    const { voter, weight, weight_quorum, ...rest } = dto;
    return new VoteWeight(
      voter,
      parseToBigInt(weight),
      parseToBigInt(weight_quorum),
      rest
    );
  }

  public static fromDocument(dto: VoteWeightDocument): VoteWeight {
    const { voter, weight, weight_quorum, ...rest } = dto;
    return new VoteWeight(
      voter,
      parseToBigInt(weight),
      parseToBigInt(weight_quorum),
      rest
    );
  }

  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly voter: string,
    public readonly weight: bigint,
    public readonly weightQuorum: bigint,
    public readonly rest: object
  ) { }

  public toDocument(): VoteWeightDocument {
    const { voter, weight, weightQuorum, rest } = this;

    const document: VoteWeightDocument = {
      voter,
      weight: Long.fromBigInt(weight),
      weight_quorum: Long.fromBigInt(weightQuorum),
      ...rest,
    };

    return document;
  }
}
