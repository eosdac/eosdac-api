import { GetVotingPowerQueryModel } from '../get-voting-power.query-model';

/*imports*/
/*mocks*/
const voter = "voter";
const voteTimestamp: Date = new Date("2022-10-20T15:55:46.000Z");

describe('GetVotingPowerQueryModel Unit tests', () => {
    it('"GetVotingPowerQueryModel.toQueryParams" should create mongodb query model', async () => {
        const model = GetVotingPowerQueryModel.create(voter, voteTimestamp);

        expect(model.toQueryParams()).toEqual(
            {
                "filter": {
                    "block_timestamp": {
                        "$lt": voteTimestamp,
                    },
                    "code": "stkvt.worlds",
                    "data.voter": voter,
                    "table": "weights",
                },
                "options": {
                    "limit": 1,
                    "sort": {
                        "block_timestamp": -1,
                    },
                },
            });
    });

    /*unit-tests*/
});
