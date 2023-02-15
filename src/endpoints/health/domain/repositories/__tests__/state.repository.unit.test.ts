import 'reflect-metadata';

import { StateRepository } from '../state.repository';

describe('StateRepository unit tests', () => {
    it('"Token" should be set', () => {
        expect(StateRepository.Token).not.toBeNull();
    });
});
