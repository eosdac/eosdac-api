import { Result } from '@alien-worlds/api-core';
import { Container } from 'inversify';

import { CandidatesVotersHistoryOutputItem } from '../../data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryController } from '../candidates-voters-history.controller';
import { CandidatesVotersHistoryInput } from '../models/candidates-voters-history.input';
import { CandidatesVotersHistoryOutput } from '../models/candidates-voters-history.output';
import { CountVotersHistoryUseCase } from '../use-cases/count-voters-history.use-case';
import { GetCandidatesVotersHistoryUseCase } from '../use-cases/get-candidates-voters-history.use-case';
import { GetVotingPowerUseCase } from '../use-cases/get-voting-power.use-case';

import 'reflect-metadata';

/*imports*/

const voterHistoryResp: CandidatesVotersHistoryOutputItem[] = [{
    voter: 'string',
    votingPower: 1n,
    voteTimestamp: new Date('2022-10-20T15:55:46.000Z'),
    candidate: 'string',
    transactionId: 'string',
}];


/*mocks*/
const getCandidatesVotersHistoryUseCase = {
    execute: jest.fn(() => (Result.withContent(voterHistoryResp))),
};

const getVotingPowerUseCase = {
    execute: jest.fn(() => (Result.withContent(1n))),
};

const countVotersHistoryUseCase = {
    execute: jest.fn(() => (Result.withContent(1))),
};


let container: Container;
let controller: CandidatesVotersHistoryController;
let input: CandidatesVotersHistoryInput;

describe('VotingHistory Controller Unit tests', () => {
    beforeAll(() => {
        container = new Container();
        /*bindings*/
        container
            .bind<GetCandidatesVotersHistoryUseCase>(GetCandidatesVotersHistoryUseCase.Token)
            .toConstantValue(getCandidatesVotersHistoryUseCase as any);
        container
            .bind<GetVotingPowerUseCase>(GetVotingPowerUseCase.Token)
            .toConstantValue(getVotingPowerUseCase as any);
        container
            .bind<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token)
            .toConstantValue(countVotersHistoryUseCase as any);
        container.bind<CandidatesVotersHistoryController>(CandidatesVotersHistoryController.Token).to(CandidatesVotersHistoryController);
    });

    beforeEach(() => {
        controller = container.get<CandidatesVotersHistoryController>(CandidatesVotersHistoryController.Token);
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
    /*unit-tests*/
});
