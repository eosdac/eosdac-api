import {
	WorkerProposal,
	WorkerProposalDocument,
} from '@alien-worlds/eosdac-api-common';
import { ProposalsCountsOutput } from '../proposals-counts.output';
/*imports*/
/*mocks*/
const workerProposals: WorkerProposal[] = [
	WorkerProposal.fromDocument(<WorkerProposalDocument>{
		dac_id: 'eyeke',
		status: 1,
		approve_voted: 'eyeke.worlds',
	}),
];

describe('ProposalsCountsOutput Unit tests', () => {
	it('"ProposalsCountsOutput.create" should create instance', async () => {
		const output = ProposalsCountsOutput.create(workerProposals);

		expect(output).toBeInstanceOf(ProposalsCountsOutput);
	});

	it('ProposalsCountsOutput.toJson should return json object', async () => {
		const output = ProposalsCountsOutput.create(workerProposals);

		expect(output.toJson()).toBeInstanceOf(Object);
	});

	/*unit-tests*/
});
