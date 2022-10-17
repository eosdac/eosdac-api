import 'reflect-metadata';

import { Container } from 'inversify';
import { GetProposalsUseCase } from '../use-cases/get-proposals.use-case';
import { ProposalsCountsController } from '../proposals-counts.controller';
import { ProposalsCountsInput } from '../models/proposals-counts.input';
import { Result } from '@alien-worlds/api-core';

/*imports*/

/*mocks*/
const getProposalsUseCase = {
	execute: jest.fn(() => Result.withContent(1)),
};

let container: Container;
let controller: ProposalsCountsController;
const input: ProposalsCountsInput = { account: 'string' };

describe('ProposalsCounts Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<GetProposalsUseCase>(GetProposalsUseCase.Token)
			.toConstantValue(getProposalsUseCase as any);
		container
			.bind<ProposalsCountsController>(ProposalsCountsController.Token)
			.to(ProposalsCountsController);
	});

	beforeEach(() => {
		controller = container.get<ProposalsCountsController>(
			ProposalsCountsController.Token
		);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(ProposalsCountsController.Token).not.toBeNull();
	});

	it('Should execute GetProposalsUseCase', async () => {
		await controller.proposalsCounts(input);

		expect(getProposalsUseCase.execute).toBeCalled();
	});
	/*unit-tests*/
});
