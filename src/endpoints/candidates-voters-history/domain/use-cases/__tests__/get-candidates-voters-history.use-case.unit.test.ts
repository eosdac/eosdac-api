import { Failure, Long, Result } from '@alien-worlds/api-core';
import { Action, ActionRepository } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { CandidatesVotersHistoryInput } from '../../models/candidates-voters-history.input';
import { GetCandidatesVotersHistoryUseCase } from '../get-candidates-voters-history.use-case';

import 'reflect-metadata';

/*imports*/
/*mocks*/

const actionRepository = {
    aggregate: jest.fn(),
};

let container: Container;
let useCase: GetCandidatesVotersHistoryUseCase;
const input: CandidatesVotersHistoryInput = CandidatesVotersHistoryInput.fromRequest({
    dacId: 'string',
    candidateId: 'string',
    skip: 0,
    limit: 20,
})

const actions: Action[] = [
    Action.fromDocument({
        block_num: Long.ZERO,
        action: {
            authorization: null,
            account: "dao.worlds",
            name: "stprofile",
            data: {
                cand: "awtesteroo12",
                profile: "{\"givenName\":\"awtesteroo12 name\",\"familyName\":\"awtesteroo12Family Name\",\"image\":\"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png\",\"description\":\"Here's a description of this amazing candidate with the name: awtesteroo12.\\n And here's another line about something.\"}",
                dac_id: "testa"
            }
        }
    })
]

describe('Get User Voting History Unit tests', () => {
    beforeAll(() => {
        container = new Container();

        container
            .bind<ActionRepository>(ActionRepository.Token)
            .toConstantValue(actionRepository as any);
        container
            .bind<GetCandidatesVotersHistoryUseCase>(GetCandidatesVotersHistoryUseCase.Token)
            .to(GetCandidatesVotersHistoryUseCase);
    });

    beforeEach(() => {
        useCase = container.get<GetCandidatesVotersHistoryUseCase>(GetCandidatesVotersHistoryUseCase.Token);
    });

    afterAll(() => {
        jest.clearAllMocks();
        container = null;
    });

    it('"Token" should be set', () => {
        expect(GetCandidatesVotersHistoryUseCase.Token).not.toBeNull();
    });

    it('Should return a failure when action repository fails', async () => {
        actionRepository.aggregate.mockResolvedValue(Result.withFailure(Failure.fromError("error")))
        const result = await useCase.execute(input);
        expect(result.isFailure).toBeTruthy();
    });

    it('should return UserVote', async () => {
        actionRepository.aggregate.mockResolvedValue(Result.withContent(actions))
        const result = await useCase.execute(input);
        expect(result.content).toBeInstanceOf(Array);
    });

    /*unit-tests*/
});

