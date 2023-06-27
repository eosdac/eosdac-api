import 'reflect-metadata';

import { Container } from '@alien-worlds/api-core';
import { GetUserVotingHistoryUseCase } from '../use-cases/get-user-voting-history.use-case';
import { VotingHistoryController } from '../voting-history.controller';
import { VotingHistoryInput } from '../models/voting-history.input';

const getUserVotingHistoryUseCase = {
  execute: jest.fn(() => ({})),
};

let container: Container;
let controller: VotingHistoryController;
let input: VotingHistoryInput;

describe('VotingHistory Controller Unit tests', () => {
  beforeAll(() => {
    container = new Container();

    container
      .bind<GetUserVotingHistoryUseCase>(GetUserVotingHistoryUseCase.Token)
      .toConstantValue(getUserVotingHistoryUseCase as any);
    container
      .bind<VotingHistoryController>(VotingHistoryController.Token)
      .to(VotingHistoryController);
  });

  beforeEach(() => {
    controller = container.get<VotingHistoryController>(
      VotingHistoryController.Token
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    container = null;
  });

  it('"Token" should be set', () => {
    expect(VotingHistoryController.Token).not.toBeNull();
  });

  it('Should execute VotingHistoryUseCase', async () => {
    await controller.votingHistory(input);

    expect(getUserVotingHistoryUseCase.execute).toBeCalled();
  });
});
