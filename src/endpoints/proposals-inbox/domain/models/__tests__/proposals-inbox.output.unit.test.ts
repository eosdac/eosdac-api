import {
	WorkerProposal,
	WorkerProposalDocument,
} from '@alien-worlds/eosdac-api-common';
import { ProposalsInboxOutput } from '../proposals-inbox.output';

/*imports*/
/*mocks*/
const workerProposals: WorkerProposal[] = [
	WorkerProposal.fromDocument(<WorkerProposalDocument>{
		dac_id: 'eyeke',
		status: 1,
		approve_voted: 'eyeke.worlds',
	}),
];

describe('ProposalsInboxOutput Unit tests', () => {
	it('"ProposalsInboxOutput.create" should create instance', async () => {
		const output = ProposalsInboxOutput.create(workerProposals);

		expect(output).toBeInstanceOf(ProposalsInboxOutput);
	});

	it('ProposalsInboxOutput.toJson should return json object', async () => {
		const output = ProposalsInboxOutput.create(workerProposals);

		expect(output.toJson()).toBeInstanceOf(Object);
	});

	/*unit-tests*/
});
