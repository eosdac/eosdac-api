import 'reflect-metadata';

import { State, StateDocument } from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';
import { Failure, Long } from '@alien-worlds/api-core';
import { GetCurrentBlockUseCase } from '../use-cases/get-current-block.use-case';
import { StateController } from '../state.controller';

/*imports*/

/*mocks*/
const getCurrentBlockUseCase = {
	execute: jest.fn().mockResolvedValue({
		content: State.fromDto(<StateDocument>{
			name: 'currentBlock',
			value: Long.fromBigInt(123n),
		}),
	}),
};

let container: Container;
let controller: StateController;

describe('State Controller Unit tests', () => {
	beforeAll(() => {
		container = new Container();
		/*bindings*/
		container
			.bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token)
			.toConstantValue(getCurrentBlockUseCase as any);
		container.bind<StateController>(StateController.Token).to(StateController);
	});

	beforeEach(() => {
		controller = container.get<StateController>(StateController.Token);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(StateController.Token).not.toBeNull();
	});

	it('Should execute getCurrentBlockUseCase', async () => {
		await controller.getState();

		expect(getCurrentBlockUseCase.execute).toBeCalled();
	});
	/*unit-tests*/

	it('Should return success', async () => {
		const result = await controller.getState();

		expect(result.content).toBeTruthy();
	});

	it('Should return failure from getCurrentBlockUseCase', async () => {
		getCurrentBlockUseCase.execute.mockResolvedValue({
			failure: Failure.fromError('fake error'),
		});

		const result = await controller.getState();
		expect(result.isFailure).toBeTruthy();
	});
});
