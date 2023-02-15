import { MongoDB } from '@alien-worlds/api-core';
import { State } from '../state';
import { StateDocument } from '../../../data/dtos/state.dto';

/*imports*/
/*mocks*/
const stateDto: StateDocument = {
    name: 'currentBlock',
    value: MongoDB.Long.fromBigInt(123n),
};

describe('State unit tests', () => {
    it('State.fromDto should return State object based on the provided dto', async () => {
        const state = State.fromDto(stateDto);

        expect(state.currentBlock).toEqual(BigInt(123));
    });

    it('"toDto" should return a dto based on entity', async () => {
        const state = State.fromDto(stateDto);

        expect(state.toDto()).toEqual(stateDto);
    });

    /*unit-tests*/
});
