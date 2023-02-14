import 'reflect-metadata';

import { Container, Failure, Result } from '@alien-worlds/api-core';

import { CandidatesVotersHistoryInput } from '../../models/candidates-voters-history.input';
import { ContractActionRepository } from '@alien-worlds/eosdac-api-common';
import { CountVotersHistoryUseCase } from '../count-voters-history.use-case';

/*imports*/
/*mocks*/


let container: Container;
let useCase: CountVotersHistoryUseCase;
const input: CandidatesVotersHistoryInput = CandidatesVotersHistoryInput.fromRequest({
    dacId: 'string',
    candidateId: 'string',
    skip: 0,
    limit: 20,
})

const contractActionRepository = {
    count: jest.fn(),
};

describe('Count Voters History Unit tests', () => {
    beforeAll(() => {
        container = new Container();

        container
            .bind<ContractActionRepository>(ContractActionRepository.Token)
            .toConstantValue(contractActionRepository as any);

        container
            .bind<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token)
            .to(CountVotersHistoryUseCase);
    });

    beforeEach(() => {
        useCase = container.get<CountVotersHistoryUseCase>(CountVotersHistoryUseCase.Token);
    });

    afterAll(() => {
        jest.clearAllMocks();
        container = null;
    });

    it('"Token" should be set', () => {
        expect(CountVotersHistoryUseCase.Token).not.toBeNull();
    });

    it('Should return a failure when action repository fails', async () => {
        contractActionRepository.count.mockResolvedValue(Result.withFailure(Failure.fromError("error")))

        const result = await useCase.execute(input);
        expect(result.isFailure).toBeTruthy();
    });

    it('should return Number', async () => {
        contractActionRepository.count.mockResolvedValue(Result.withContent(1))

        const result = await useCase.execute(input);
        expect(result.content).toBe(1);
    });

    /*unit-tests*/
});

