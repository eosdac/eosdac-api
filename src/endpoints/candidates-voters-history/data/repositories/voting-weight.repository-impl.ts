import { CollectionSource, Mapper, MongoDB, MongoSource, RepositoryImpl, Result } from '@alien-worlds/api-core';

import { GetVotingPowerQueryModel } from '../../domain/models/get-voting-power.query-model';
import { VoteWeight } from '../../domain/entities/vote-weight';
import { VoteWeightDocument } from '../dtos/weights.dto';

export class VotingWeightRepositoryImpl extends RepositoryImpl<
  VoteWeight,
  VoteWeightDocument
> {
  private contractRows: MongoDB.Collection;

  constructor(
    source: CollectionSource<VoteWeightDocument>,
    mapper: Mapper<VoteWeight, VoteWeightDocument>,
    mongoSource: MongoSource
  ) {
    super(source, mapper);
    this.contractRows = mongoSource.database.collection('contract_rows');
  }

  async findOne(
    model: GetVotingPowerQueryModel
  ): Promise<Result<VoteWeight>> {
    let voteWeight: VoteWeight;

    const { filter, options } = model.toQueryParams();
    const contractRowRes = await this.contractRows.findOne(filter, options)
    if (contractRowRes) {
      voteWeight = VoteWeight.fromTableRow(contractRowRes.data)
    }

    return Result.withContent(voteWeight)
  }
}
