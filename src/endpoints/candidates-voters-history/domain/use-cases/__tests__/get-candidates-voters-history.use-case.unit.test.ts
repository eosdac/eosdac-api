import 'reflect-metadata';

import {
  Container,
  ContractAction,
  Failure,
  MongoDB,
  Result,
} from '@alien-worlds/api-core';
import { DaoWorldsContract } from '@alien-worlds/dao-api-common';

import { CandidatesVotersHistoryInput } from '../../models/candidates-voters-history.input';
import { GetCandidatesVotersHistoryUseCase } from '../get-candidates-voters-history.use-case';
import { DaoWorldsActionRepository } from '@alien-worlds/dao-api-common/build/contracts/dao-worlds/actions/domain/repositories';

/*imports*/
/*mocks*/

const contractActionRepository = {
  aggregate: jest.fn(),
};

let container: Container;
let useCase: GetCandidatesVotersHistoryUseCase;
const input: CandidatesVotersHistoryInput =
  CandidatesVotersHistoryInput.fromRequest({
    dacId: 'string',
    candidateId: 'string',
    skip: 0,
    limit: 20,
  });

const actions: ContractAction[] = [
  ContractAction.fromDocument(
    {
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
    },
    DaoWorldsContract.Actions.Entities.SetProfile.fromDocument
  ),
];

describe('Get User Voting History Unit tests', () => {
  beforeAll(() => {
    container = new Container();
    container
      .bind<DaoWorldsActionRepository>(DaoWorldsActionRepository.Token)
      .toConstantValue(contractActionRepository as any);
    container
      .bind<GetCandidatesVotersHistoryUseCase>(
        GetCandidatesVotersHistoryUseCase.Token
      )
      .to(GetCandidatesVotersHistoryUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetCandidatesVotersHistoryUseCase>(
      GetCandidatesVotersHistoryUseCase.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetCandidatesVotersHistoryUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when action repository fails', async () => {
    contractActionRepository.aggregate.mockResolvedValue(
      Result.withFailure(Failure.fromError('error'))
    );
    const result = await useCase.execute(input);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return UserVote', async () => {
    contractActionRepository.aggregate.mockResolvedValue(
      Result.withContent(actions)
    );
    const result = await useCase.execute(input);
    expect(result.content).toBeInstanceOf(Array);
  });

  /*unit-tests*/
});
