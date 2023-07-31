import * as dacUtils from '@common/utils/dac.utils';
import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';
import * as IndexWorldsCommon from '@alien-worlds/aw-contract-index-worlds';

import { Container, ContractAction, Failure } from '@alien-worlds/aw-core';
import { DacMapper } from '@endpoints/dacs/data/mappers/dacs.mapper';
import { GetProfilesUseCase } from '../use-cases/get-profiles.use-case';
import { ProfileController } from '../profile.controller';
import { GetProfileInput } from '../models/get-profile.input';
import { Result } from '@alien-worlds/aw-core';

let container: Container;
let controller: ProfileController;

const getProfilesUseCase = {
  execute: jest.fn(),
};

const isProfileFlaggedUseCase = {
  execute: jest.fn(() =>
    Result.withContent([
      DaoWorldsCommon.Actions.Entities.Flagcandprof.create(
        'awtesteroo13',
        'reason',
        'reporter',
        true,
        'testa'
      ),
    ])
  ),
};

const dac = new DacMapper().toDac(
  new IndexWorldsCommon.Deltas.Mappers.DacsRawMapper().toEntity(<
    IndexWorldsCommon.Deltas.Types.DacsRawModel
  >{
    accounts: [{ key: '2', value: 'dao.worlds' }],
    symbol: {
      sym: 'EYE',
    },
    refs: [],
  })
);

jest
  .spyOn(dacUtils, 'loadDacConfig')
  .mockResolvedValue(Result.withContent(dac));

const indexWorldsContractService = {
  fetchDacs: jest.fn(),
};
const input: GetProfileInput = {
  accounts: ['awtesteroo12', 'awtesteroo13'],
  dacId: 'testa',
  toJSON: () => ({
    accounts: ['awtesteroo12', 'awtesteroo13'],
    dacId: 'testa',
  }),
};

const actions: ContractAction<
  DaoWorldsCommon.Actions.Entities.Stprofile,
  DaoWorldsCommon.Actions.Types.StprofileMongoModel
>[] = [
  new ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile>(
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
  ),
  new ContractAction<DaoWorldsCommon.Actions.Entities.Stprofile>(
    'mgaqy.wam',
    new Date('2021-02-25T04:18:56.000Z'),
    209788071n,
    'dao.worlds',
    'stprofile',
    65909692154n,
    1980618n,
    '591B113058F8AD3FBFF99C7F2BA92A921919F634A73CBA4D8059FAE8D2F5666B',
    DaoWorldsCommon.Actions.Entities.Stprofile.create(
      'awtesteroo13',
      '{"givenName":"awtesteroo13 name","familyName":"awtesteroo12Family Name","image":"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png","description":"Here\'s a description of this amazing candidate with the name: awtesteroo12.\\n And here\'s another line about something."}',
      'testa'
    )
  ),
];

describe('Profile Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
      .toConstantValue(getProfilesUseCase as any);
    container
      .bind<IndexWorldsCommon.Services.IndexWorldsContractService>(
        IndexWorldsCommon.Services.IndexWorldsContractService.Token
      )
      .toConstantValue(indexWorldsContractService as any);
    container
      .bind<ProfileController>(ProfileController.Token)
      .to(ProfileController);
  });

  beforeEach(() => {
    controller = container.get<ProfileController>(ProfileController.Token);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    container = null;
  });

  it('"Token" should be set', () => {
    expect(ProfileController.Token).not.toBeNull();
  });

  it('should return profile', async () => {
    getProfilesUseCase.execute.mockResolvedValue(Result.withContent(actions));

    const output = await controller.getProfile(input);

    expect(output.count).toBe(2);

    expect(output.profiles).toBeDefined();
    expect(output.profiles[0].account).toBe(input.accounts[0]);
    expect(output.profiles[1].account).toBe(input.accounts[1]);
  });

  it('should return redacted profile for flagged candidate', async () => {
    getProfilesUseCase.execute.mockResolvedValue(Result.withContent(actions));

    const output = await controller.getProfile(input);

    expect(output.profiles).toBeDefined();
    expect(output.profiles[1].account).toBe(input.accounts[1]);
    expect(output.profiles[1].error).toBeDefined();
    expect(output.profiles[1].error.name).toBe('Redacted Candidate');
  });

  it('should return error if indexWorldsContractService fails', async () => {
    jest.spyOn(dacUtils, 'loadDacConfig').mockResolvedValueOnce(null);

    const output = await controller.getProfile(input);

    expect(output.failure).toBeTruthy();
  });

  it('should return error if no profiles are found', async () => {
    getProfilesUseCase.execute.mockResolvedValue(Result.withContent([]));

    const output = await controller.getProfile(input);

    expect(output.failure).toBeTruthy();
  });

  it('should return error if getProfilesUseCase fails', async () => {
    getProfilesUseCase.execute.mockResolvedValue(
      Result.withFailure(Failure.fromError('error'))
    );

    const output = await controller.getProfile(input);

    expect(output.failure).toBeTruthy();
  });
});
