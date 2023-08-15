import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { Actions } from '@alien-worlds/aw-contract-dao-worlds';
import { FlagRepository } from '../../repositories/flag.repository';
import { GetProfileFlagsUseCase } from '../get-profile-flags.use-case';
import { Result } from '@alien-worlds/aw-core';

const input = {
    dacId: 'eyeke',
    accounts: ['account1', 'account2']
}

describe('GetProfileFlagsUseCase', () => {
    describe('execute', () => {
        it('should return a successful result with flags when accounts are provided', async () => {
            const mockFlagcandprofArray: Actions.Entities.Flagcandprof[] = [
                DaoWorldsCommon.Actions.Entities.Flagcandprof.create(
                    input.accounts[0], 'reason', 'reporter', true, input.dacId,
                ),
            ];
            const mockFlagRepository: FlagRepository = {
                aggregate: jest.fn().mockResolvedValue(Result.withContent(mockFlagcandprofArray)),
            } as any;
            const getProfileFlagsUseCase = new GetProfileFlagsUseCase(mockFlagRepository);

            const result = await getProfileFlagsUseCase.execute(input.dacId, input.accounts);

            expect(result).toEqual(Result.withContent(mockFlagcandprofArray));
        });

        it('should return an array result when aggregate returns a single object', async () => {
            const mockFlagcandprof = DaoWorldsCommon.Actions.Entities.Flagcandprof.create(
                input.accounts[0], 'reason', 'reporter', true, input.dacId,
            );
            const mockFlagRepository: FlagRepository = {
                aggregate: jest.fn().mockResolvedValue(Result.withContent(mockFlagcandprof)),
            } as any;
            const getProfileFlagsUseCase = new GetProfileFlagsUseCase(mockFlagRepository);

            const result = await getProfileFlagsUseCase.execute(input.dacId, input.accounts);

            expect(result).toEqual(Result.withContent([mockFlagcandprof]));
        });

        it('should return a failed result when aggregation fails', async () => {
            const mockFailureMessage = 'some error';
            const mockFlagRepository: FlagRepository = {
                aggregate: jest.fn().mockResolvedValue(Result.withFailure(mockFailureMessage)),
            } as any;
            const getProfileFlagsUseCase = new GetProfileFlagsUseCase(mockFlagRepository);

            const result = await getProfileFlagsUseCase.execute(input.dacId, input.accounts);

            expect(result).toEqual(Result.withFailure(mockFailureMessage));
        });

        it('should return an empty array when no accounts are provided', async () => {
            const mockFlagRepository: FlagRepository = {
                aggregate: jest.fn(),
            } as any;
            const getProfileFlagsUseCase = new GetProfileFlagsUseCase(mockFlagRepository);

            const result = await getProfileFlagsUseCase.execute(input.dacId, []);

            expect(result).toEqual(Result.withContent(undefined));
        });
    });
});
