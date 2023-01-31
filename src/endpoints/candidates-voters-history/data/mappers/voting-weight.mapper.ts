import { Mapper } from '@alien-worlds/api-core';
import { VoteWeight } from '../../domain/entities/vote-weight';
import { VoteWeightDocument } from '../dtos/weights.dto';

export class VotingWeightMapper
  implements Mapper<VoteWeight, VoteWeightDocument>
{
  public toEntity(document: VoteWeightDocument): VoteWeight {
    return VoteWeight.fromDocument(document);
  }
  public toDataObject(entity: VoteWeight): VoteWeightDocument {
    return entity.toDocument();
  }
}
