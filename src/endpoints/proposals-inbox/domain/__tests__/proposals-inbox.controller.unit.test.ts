import 'reflect-metadata';

import { Container } from 'inversify';
import { ListProposalsUseCase } from '../use-cases/list-proposals.use-case';
import { ProposalsInboxController } from '../proposals-inbox.controller';
import { Result } from '@alien-worlds/api-core';
import { WorkerProposal } from '@alien-worlds/eosdac-api-common';

/*imports*/

/*mocks*/
const listProposalsUseCase = {
	execute: jest.fn(() =>
		Result.withContent(
			WorkerProposal.fromDocument({
				dac_id: 'eyeke',
				status: 1,
				finalize_voted: 'eyeke.worlds',
			})
		)
	),
};

let container: Container;
let controller: ProposalsInboxController;

describe('ProposalsInbox Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<ListProposalsUseCase>(ListProposalsUseCase.Token)
			.toConstantValue(listProposalsUseCase as any);
		container
			.bind<ProposalsInboxController>(ProposalsInboxController.Token)
			.to(ProposalsInboxController);
	});

	beforeEach(() => {
		controller = container.get<ProposalsInboxController>(
			ProposalsInboxController.Token
		);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(ProposalsInboxController.Token).not.toBeNull();
	});

	it('Should execute ProposalsInboxUseCase', async () => {
		await controller.proposalsInbox({
			account: 'string',
			dacId: 'string',
			skip: 0,
			limit: 100,
		});

		expect(listProposalsUseCase.execute).toBeCalled();
	});
	/*unit-tests*/
});
