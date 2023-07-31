import 'reflect-metadata';

import { Container, Failure, Result } from '@alien-worlds/aw-core';

import { CandidatesVotersHistoryController } from '../candidates-voters-history.controller';
import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { VoteModel } from '../../data/dtos/candidates-voters-history.dto';
import { CountVotersHistoryUseCase } from '../use-cases/count-voters-history.use-case';
import { GetCandidatesVotersHistoryUseCase } from '../use-cases/get-candidates-voters-history.use-case';
import { AssignVotingPowerUseCase } from '../use-cases/assign-voting-power.use-case';

const voterHistoryResp: VoteModel[] = [
  {
    voter: 'string',
    votingPower: 1,
    voteTimestamp: new Date('2022-10-20T15:55:46.000Z'),
    candidate: 'string',
    transactionId: 'string',
  },
];

const getCandidatesVotersHistoryUseCase = {
  execute: jest.fn(
    (): Result<VoteModel[], Error> => Result.withContent(voterHistoryResp)
  ),
};

const assignVotingPowerUseCase = {
  execute: jest.fn(() => Result.withContent(1n)),
};

const countVotersHistoryUseCase = {
  execute: jest.fn((): Result<number, Error> => Result.withContent(1)),
};

let container: Container;
let controller: CandidatesVotersHistoryController;
let input: CandidatesVotersHistoryInput;

describe('VotingHistory Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<GetCandidatesVotersHistoryUseCase>(
        GetCandidatesVotersHistoryUseCase.Token
      )
      .toConstantValue(getCandidatesVotersHistoryUseCase as any);
    container
      .bind<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token)
      .toConstantValue(countVotersHistoryUseCase as any);
    container
      .bind<AssignVotingPowerUseCase>(AssignVotingPowerUseCase.Token)
      .toConstantValue(assignVotingPowerUseCase as any);
    container
      .bind<CandidatesVotersHistoryController>(
        CandidatesVotersHistoryController.Token
      )
      .to(CandidatesVotersHistoryController);
  });

  beforeEach(() => {
    controller = container.get<CandidatesVotersHistoryController>(
      CandidatesVotersHistoryController.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(CandidatesVotersHistoryController.Token).not.toBeNull();
  });

  it('Should execute VotingHistoryUseCase', async () => {
    await controller.candidatesVotersHistory(input);

    expect(getCandidatesVotersHistoryUseCase.execute).toBeCalled();
  });

  it('Should return failure when GetCandidatesVotersHistoryUseCase fails', async () => {
    getCandidatesVotersHistoryUseCase.execute.mockImplementationOnce(() =>
      Result.withFailure(Failure.withMessage('error'))
    );

    const output = await controller.candidatesVotersHistory(input);

    expect(output.failure).toBeTruthy();
  });

  it('Should return failure when CountVotersHistoryUseCase fails', async () => {
    countVotersHistoryUseCase.execute.mockImplementationOnce(() =>
      Result.withFailure(Failure.withMessage('error'))
    );

    const output = await controller.candidatesVotersHistory(input);

    expect(output.failure).toBeTruthy();
  });
});
