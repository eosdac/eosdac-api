import 'reflect-metadata';

import { FlagRepository } from '../flag.repository';

describe('FlagRepository unit tests', () => {
  it('"Token" should be set', () => {
    expect(FlagRepository.Token).not.toBeNull();
  });
});
