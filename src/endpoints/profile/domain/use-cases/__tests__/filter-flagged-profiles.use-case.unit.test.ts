import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import { ContractAction, Result } from '@alien-worlds/aw-core';

import { ActionToProfileMapper } from '@endpoints/profile/data/mappers/action-to-profile.mapper';
import { FilterFlaggedProfilesUseCase } from '../filter-flagged-profiles.use-case'
import { GetProfileFlagsUseCase } from '../get-profile-flags.use-case';
import { Profile } from '../../entities/profile';
import { ProfileItem } from '../../entities/profile-item';

const input = {
    dacId: 'eyeke',
    accounts: ['awtesteroo12', 'awtesteroo13']
}


const profContractAction: ContractAction<
    DaoWorldsCommon.Actions.Entities.Stprofile,
    DaoWorldsCommon.Actions.Types.StprofileMongoModel
> = new ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile>(
    'mgaqy.wam',
    new Date('2021-02-25T04:18:56.000Z'),
    209788070n,
    'dao.worlds',
    'stprofile',
    65909692153n,
    1980617n,
    '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666C',
    DaoWorldsCommon.Actions.Entities.Stprofile.create(
        'awtesteroo12',
        '{"givenName":"awtesteroo12 name","familyName":"awtesteroo12Family Name","image":"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png","description":"Here\'s a description of this amazing candidate with the name: awtesteroo12.\\n And here\'s another line about something."}',
        'testa'
    )
);

const flaggedProfContractAction: ContractAction<
    DaoWorldsCommon.Actions.Entities.Stprofile,
    DaoWorldsCommon.Actions.Types.StprofileMongoModel
> = new ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile>(
    'lda3y.wim',
    new Date('2021-03-25T04:18:56.000Z'),
    209788071n,
    'dao.worlds',
    'stprofile',
    65909692154n,
    1980618n,
    '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666D',
    DaoWorldsCommon.Actions.Entities.Stprofile.create(
        'awtesteroo13',
        '{"givenName":"awtesteroo13 name","familyName":"awtesteroo13Family Name","image":"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png","description":"Here\'s a description of this amazing candidate with the name: awtesteroo13.\\n And here\'s another line about something."}',
        'testa'
    )
);

const profile: Profile = ActionToProfileMapper.toEntity(profContractAction);
const flaggedProfile: Profile = ActionToProfileMapper.toEntity(flaggedProfContractAction);

describe('FilterFlaggedProfilesUseCase', () => {
    describe('execute', () => {
        it('should return a successful result with filtered profiles when flags are present', async () => {
            const mockProfiles: Profile[] = [profile, flaggedProfile];
            const mockFlags = [
                DaoWorldsCommon.Actions.Entities.Flagcandprof.create(
                    input.accounts[0], 'reason', 'reporter', true, input.dacId,
                )
            ];
            const mockGetProfileFlagsUseCase: GetProfileFlagsUseCase = {
                execute: jest.fn().mockResolvedValue(Result.withContent(mockFlags)),
            } as any;

            const filterFlaggedProfilesUseCase = new FilterFlaggedProfilesUseCase(mockGetProfileFlagsUseCase);
            const result = await filterFlaggedProfilesUseCase.execute(input.dacId, input.accounts, mockProfiles);
            console.dir(result, { depth: null });

            expect(result.content).toBeDefined();
            expect(result).toBeDefined();
        });

        it('should return a failed result when getProfileFlagsUseCase fails', async () => {
            const mockFailureMessage = 'Get flags failed';
            const mockGetProfileFlagsUseCase: GetProfileFlagsUseCase = {
                execute: jest.fn().mockResolvedValue(Result.withFailure(mockFailureMessage)),
            } as any;

            const filterFlaggedProfilesUseCase = new FilterFlaggedProfilesUseCase(mockGetProfileFlagsUseCase);
            const result = await filterFlaggedProfilesUseCase.execute(input.dacId, input.accounts, []);
            expect(result).toEqual(Result.withFailure(mockFailureMessage));
        });

        it('should return original profiles when no flags are present', async () => {
            const mockProfiles: Profile[] = [profile, flaggedProfile];
            const mockGetProfileFlagsUseCase: GetProfileFlagsUseCase = {
                execute: jest.fn().mockResolvedValue(Result.withContent([])),
            } as any;

            const filterFlaggedProfilesUseCase = new FilterFlaggedProfilesUseCase(mockGetProfileFlagsUseCase);
            const result = await filterFlaggedProfilesUseCase.execute(input.dacId, input.accounts, mockProfiles);
            expect(result).toEqual(Result.withContent(mockProfiles));
        });
    });
});
