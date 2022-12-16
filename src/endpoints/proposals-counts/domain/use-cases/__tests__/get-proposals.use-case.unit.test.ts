import 'reflect-metadata';

import {
	WorkerProposal,
	WorkerProposalDocument,
	WorkerProposalRepository,
} from '@alien-worlds/eosdac-api-common';

import { Container } from 'inversify';
import { GetProposalsUseCase } from '../get-proposals.use-case';
import { ProposalsCountsInput } from '../../models/proposals-counts.input';

/*imports*/
/*mocks*/

const workerProposalRepository = {
	find: jest.fn(),
	count: jest.fn(),
};

let container: Container;
let useCase: GetProposalsUseCase;
const input: ProposalsCountsInput = { account: 'string' };

describe('Get Proposals Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<WorkerProposalRepository>(WorkerProposalRepository.Token)
			.toConstantValue(workerProposalRepository as any);
		container
			.bind<GetProposalsUseCase>(GetProposalsUseCase.Token)
			.to(GetProposalsUseCase);
	});

	beforeEach(() => {
		useCase = container.get<GetProposalsUseCase>(GetProposalsUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetProposalsUseCase.Token).not.toBeNull();
	});

	it('Should return a failure when ...', async () => {
		workerProposalRepository.find.mockResolvedValueOnce({ isFailure: true });

		const result = await useCase.execute(input);
		expect(result.isFailure).toBeTruthy();
	});

	it('should return WorkerProposal', async () => {
		const r: WorkerProposal[] = new Array<WorkerProposal>();
		r.push(
			WorkerProposal.fromDocument(<WorkerProposalDocument>{
				dac_id: 'eyeke',
				status: 1,
				approve_voted: 'eyeke.worlds',
			})
		);
		r.push(
			WorkerProposal.fromDocument(<WorkerProposalDocument>{
				dac_id: 'eyeke',
				status: 1,
				approve_voted: 'eyeke.worlds',
			})
		);

		workerProposalRepository.find.mockResolvedValueOnce({
			content: r,
		});

		const result = await useCase.execute(input);
		expect(result.content).toBeInstanceOf(Array);
		expect(result.content[0]).toBeInstanceOf(WorkerProposal);
	});

	/*unit-tests*/
});
