import * as DaoWorldsCommon from '@alien-worlds/aw-contract-dao-worlds';

import {
  Container,
  ContractAction,
  Failure,
  Result,
} from '@alien-worlds/aw-core';

import { GetProfilesUseCase } from '../get-profiles.use-case';
import { GetProfilesUseCaseInput } from '../../../../profile/data/dtos/profile.dto';

const actionRepository = {
  aggregate: jest.fn(),
};

let container: Container;
let useCase: GetProfilesUseCase;
const useCaseInput: GetProfilesUseCaseInput = {
  custContract: 'string',
  dacId: 'testa',
  accounts: ['awtesteroo12'],
};

describe('Get Profile Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DaoWorldsCommon.Actions.DaoWorldsActionRepository>(
        DaoWorldsCommon.Actions.DaoWorldsActionRepository.Token
      )
      .toConstantValue(actionRepository as any);
    container
      .bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
      .to(GetProfilesUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetProfilesUseCase>(GetProfilesUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetProfilesUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when ...', async () => {
    actionRepository.aggregate.mockResolvedValue(
      Result.withFailure(Failure.fromError('error'))
    );
    const result = await useCase.execute(
      useCaseInput.custContract,
      useCaseInput.dacId,
      useCaseInput.accounts
    );
    expect(result.isFailure).toBeTruthy();
  });

  it('should return Profile', async () => {
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
    ];

    actionRepository.aggregate.mockResolvedValue(Result.withContent(actions));

    const result = await useCase.execute(
      useCaseInput.custContract,
      useCaseInput.dacId,
      useCaseInput.accounts
    );
    expect(result.content).toBeInstanceOf(Array);
  });
});
