import { CandidatesVotersHistoryControllerOutput } from 'src/endpoints/candidates-voters-history/data/dtos/candidates-voters-history.dto';
import { CandidatesVotersHistoryOutput } from '../candidates-voters-history.output';

/*imports*/
/*mocks*/

const data: CandidatesVotersHistoryControllerOutput = {
    results: [{
        voter: 'string',
        votingPower: 1n,
        voteTimestamp: new Date('2022-10-20T15:55:46.000Z'),
        candidate: 'string',
        transactionId: 'string',
    }],
    total: 1,
};

describe('CandidatesVotersHistoryOutput Unit tests', () => {
    it('"CandidatesVotersHistoryOutput.create" should create instance', async () => {
        const output = CandidatesVotersHistoryOutput.create(data);

        expect(output).toBeInstanceOf(CandidatesVotersHistoryOutput);
    });

    it('CandidatesVotersHistoryOutput.toJson should return json object', async () => {
        const output = CandidatesVotersHistoryOutput.create(data);

        expect(output.toJson()).toBeInstanceOf(Object);
    });

    /*unit-tests*/
});
