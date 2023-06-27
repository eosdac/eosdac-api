import 'reflect-metadata';

import * as DaoWorldsContract from '@alien-worlds/dao-worlds-common';

import {
  Container,
  ContractAction,
  Failure,
  Result,
} from '@alien-worlds/api-core';

import { GetProfilesUseCase } from '../get-profiles.use-case';
import { GetProfilesUseCaseInput } from '../../../../profile/data/dtos/profile.dto';
import { MongoDB } from '@alien-worlds/storage-mongodb';

const actionRepository = {
  update: jest.fn(),
  updateMany: jest.fn(),
  add: jest.fn(),
  addOnce: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  aggregate: jest.fn(),
  remove: jest.fn(),
  removeMany: jest.fn(),
};

let container: Container;
let useCase: GetProfilesUseCase;
const useCaseInput: GetProfilesUseCaseInput = {
  custContract: 'string',
  dacId: 'string',
  accounts: ['awtesteroo12'],
};

describe('Get Profile Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DaoWorldsContract.Actions.DaoWorldsActionRepository>(
        DaoWorldsContract.Actions.DaoWorldsActionRepository.Token
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
    const result = await useCase.execute(useCaseInput);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return Profile', async () => {
    const input = {
      block_num: MongoDB.Long.ZERO,
      action: {
        authorization: null,
        account: 'dao.worlds',
        name: 'stprofile',
        data: {
          cand: 'awtesteroo12',
          profile:
            '{"givenName":"awtesteroo12 name","familyName":"awtesteroo12Family Name","image":"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png","description":"Here\'s a description of this amazing candidate with the name: awtesteroo12.\\n And here\'s another line about something."}',
          dac_id: 'testa',
        },
      },
    };

    const actions: ContractAction[] = [
      // ContractAction.fromDocument(
      //   input,
      //   DaoWorldsContract.Actions.Entities.Stprofile
      // ),
    ];

    actionRepository.aggregate.mockResolvedValue(Result.withContent(actions));

    const result = await useCase.execute(useCaseInput);
    expect(result.content).toBeInstanceOf(Array);
  });
});
