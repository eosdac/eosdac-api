import { CandidatesVotersHistoryInput } from '../candidates-voters-history.input';
import { CountVotersHistoryQueryModel } from '../count-voters-history.query-model';

/*imports*/
/*mocks*/
const input: CandidatesVotersHistoryInput = {
    dacId: 'nerix',
    candidateId: '.to123',
    limit: 20,
    skip: 0,
};

describe('CountVotersHistoryQueryModel Unit tests', () => {
    it('"CountVotersHistoryQueryModel.toQueryParams" should create mongodb query model', async () => {
        const model = CountVotersHistoryQueryModel.create(input);

        expect(model.toQueryParams()).toEqual({
            "filter": {
                "action.account": "dao.worlds",
                "action.data.dac_id": input.dacId,
                "action.data.newvotes": input.candidateId,
                "action.name": "votecust",
            },
            "options": {},
        });
    });

    /*unit-tests*/
});

