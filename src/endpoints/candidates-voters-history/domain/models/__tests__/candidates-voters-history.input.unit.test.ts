import { CandidatesVotersHistoryInput } from '../candidates-voters-history.input';
import { CandidatesVotersHistoryRequestDto } from '../../../data/dtos/candidates-voters-history.dto';

/*imports*/

/*mocks*/
const input: CandidatesVotersHistoryRequestDto = {
    dacId: 'string',
    candidateId: 'string',
    limit: 20,
    skip: 0,
};

describe('CandidatesVotersHistoryInput Unit tests', () => {
    it('"CandidatesVotersHistoryInput.fromRequest" should create instance', async () => {
        const fromReq = CandidatesVotersHistoryInput.fromRequest(input);

        expect(fromReq).toBeInstanceOf(CandidatesVotersHistoryInput);
    });

    it('CandidatesVotersHistoryInput instance should have proper voter value', async () => {
        const fromReq = CandidatesVotersHistoryInput.fromRequest(input);

        expect(fromReq.candidateId).toBe(input.candidateId);
    });

    /*unit-tests*/
});
