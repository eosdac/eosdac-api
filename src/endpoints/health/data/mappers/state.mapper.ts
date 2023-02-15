import { Mapper } from '@alien-worlds/api-core';
import { State } from '../../domain/entities/state';
import { StateDocument } from '../dtos/state.dto';

export class StateMapper implements Mapper<State, StateDocument> {
    toEntity(document: StateDocument): State {
        return State.fromDto(document);
    }
    toDataObject(entity: State): StateDocument {
        return entity.toDto();
    }
}
