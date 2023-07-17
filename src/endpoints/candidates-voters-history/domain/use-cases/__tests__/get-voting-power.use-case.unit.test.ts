import 'reflect-metadata';

import * as StkvtWorldsCommon from '@alien-worlds/stkvt-worlds-common';

import { Container, Failure, Result } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryOutputItem } from '../../../../candidates-voters-history/data/dtos/candidates-voters-history.dto';
import { GetVotingPowerUseCase } from '../get-voting-power.use-case';

let container: Container;
let useCase: GetVotingPowerUseCase;
const stkvtWorldsDeltaRepository = {
  find: jest.fn(),
};

const data: CandidatesVotersHistoryOutputItem = {
  voter: 'string',
  votingPower: 1,
  voteTimestamp: new Date('2022-10-20T15:55:46.000Z'),
  candidate: 'string',
  transactionId: 'string',
};

describe('Get Voting Power Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository>(
        StkvtWorldsCommon.Deltas.StkvtWorldsDeltaRepository.Token
      )
      .toConstantValue(stkvtWorldsDeltaRepository as any);
    container
      .bind<GetVotingPowerUseCase>(GetVotingPowerUseCase.Token)
      .to(GetVotingPowerUseCase);
  });

  beforeEach(() => {
    useCase = container.get<GetVotingPowerUseCase>(GetVotingPowerUseCase.Token);
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(GetVotingPowerUseCase.Token).not.toBeNull();
  });

  it('Should return a failure when voting weight repository fails', async () => {
    stkvtWorldsDeltaRepository.find.mockResolvedValue(
      Result.withFailure(Failure.fromError('error'))
    );

    const result = await useCase.execute(data);
    expect(result.isFailure).toBeTruthy();
  });

  it('should return default value', async () => {
    stkvtWorldsDeltaRepository.find.mockResolvedValue(Result.withContent([]));

    const result = await useCase.execute(data);

    expect(result.content).toBe(0);
  });
});
