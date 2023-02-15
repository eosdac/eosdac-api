import { MongoDB } from '@alien-worlds/api-core';
import { State } from '../../../domain/entities/state';
import { StateDocument } from '../../dtos/state.dto';
import { StateMapper } from '../state.mapper';

/*imports*/
/*mocks*/
const stateDto: StateDocument = {
    name: 'currentBlock',
    value: MongoDB.Long.fromBigInt(123n),
};

describe('StateMapper unit tests', () => {
    it('State.fromDto should return State object based on the provided dto', async () => {
        const state = new StateMapper().toEntity(stateDto);

        expect(state.currentBlock).toEqual(BigInt(123));
    });

    it('"toDto" should return a dto based on entity', async () => {
        const state = State.fromDto(stateDto);
        expect(new StateMapper().toDataObject(state)).toEqual(stateDto);
    });

    /*unit-tests*/
});
