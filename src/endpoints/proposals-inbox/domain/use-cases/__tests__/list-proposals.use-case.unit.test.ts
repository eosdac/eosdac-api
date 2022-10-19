import 'reflect-metadata';

import {
	WorkerProposal,
	WorkerProposalDocument,
	WorkerProposalRepository,
} from '@alien-worlds/eosdac-api-common';

import { Container } from 'inversify';
import { ListProposalsUseCase } from '../list-proposals.use-case';
import { ProposalsInboxInput } from '../../models/proposals-inbox.input';

/*imports*/
/*mocks*/

const workerProposalRepository = {
	find: jest.fn(),
	count: jest.fn(),
};

let container: Container;
let useCase: ListProposalsUseCase;
const input: ProposalsInboxInput = {
	account: 'string',
	dacId: 'string',
	skip: 0,
	limit: 100,
};

describe('Get Proposals Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<WorkerProposalRepository>(WorkerProposalRepository.Token)
			.toConstantValue(workerProposalRepository);
		container
			.bind<ListProposalsUseCase>(ListProposalsUseCase.Token)
			.to(ListProposalsUseCase);
	});

	beforeEach(() => {
		useCase = container.get<ListProposalsUseCase>(ListProposalsUseCase.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(ListProposalsUseCase.Token).not.toBeNull();
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
