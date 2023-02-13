import 'reflect-metadata';

import { Failure, MongoDB, Result } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryOutputItem } from '../../../../candidates-voters-history/data/dtos/candidates-voters-history.dto';
import { Container } from 'inversify';
import { GetVotingPowerUseCase } from '../get-voting-power.use-case';
import { VoteWeight } from '../../entities/vote-weight';
import { VotingWeightRepository } from '../../repositories/voting-weight.repository';

/*imports*/
/*mocks*/


let container: Container;
let useCase: GetVotingPowerUseCase;
const votingWeightRepository = {
    findOne: jest.fn(),
};

const data: CandidatesVotersHistoryOutputItem = {
    voter: 'string',
    votingPower: 1n,
    voteTimestamp: new Date('2022-10-20T15:55:46.000Z'),
    candidate: 'string',
    transactionId: 'string',
}

describe('Get Voting Power Unit tests', () => {
    beforeAll(() => {
        container = new Container();

        container
            .bind<VotingWeightRepository>(VotingWeightRepository.Token)
            .toConstantValue(votingWeightRepository as any);
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
        votingWeightRepository.findOne.mockResolvedValue(Result.withFailure(Failure.fromError("error")))

        const result = await useCase.execute(data);
        expect(result.isFailure).toBeTruthy();
    });

    it('should return Number', async () => {
        votingWeightRepository.findOne.mockResolvedValue(Result.withContent(VoteWeight.fromDocument({
            voter: 'voter',
            weight: MongoDB.Long.ONE,
            weight_quorum: MongoDB.Long.ZERO,
        })))

        const result = await useCase.execute(data);
        expect(result.content).toBe(1n)
    });

    /*unit-tests*/
});

