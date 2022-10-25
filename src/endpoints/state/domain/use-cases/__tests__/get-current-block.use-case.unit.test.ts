import { Long } from '@alien-worlds/api-core';
import {
	State,
	StateDocument,
	StateRepository,
} from '@alien-worlds/eosdac-api-common';
import { Container } from 'inversify';

import { GetCurrentBlockUseCase } from '../get-current-block.use-case';

import 'reflect-metadata';

/*imports*/
/*mocks*/

const stateRepository: any = {
	getCurrentBlock: jest.fn(),
};

let container: Container;
let useCase: GetCurrentBlockUseCase;

describe('Get Current Block Unit tests', () => {
	beforeAll(() => {
		container = new Container();

		container
			.bind<StateRepository>(StateRepository.Token)
			.toConstantValue(stateRepository);
		container
			.bind<GetCurrentBlockUseCase>(GetCurrentBlockUseCase.Token)
			.to(GetCurrentBlockUseCase);
	});

	beforeEach(() => {
		useCase = container.get<GetCurrentBlockUseCase>(
			GetCurrentBlockUseCase.Token
		);
	});

	afterAll(() => {
		jest.clearAllMocks();
		container = null;
	});

	it('"Token" should be set', () => {
		expect(GetCurrentBlockUseCase.Token).not.toBeNull();
	});

	it('Should return a failure when there is some error in repository', async () => {
		stateRepository.getCurrentBlock.mockResolvedValueOnce({ isFailure: true });

		const result = await useCase.execute();
		expect(result.isFailure).toBeTruthy();
	});

	it('should return State', async () => {
		stateRepository.getCurrentBlock.mockResolvedValueOnce({
			content: State.fromDto(<StateDocument>{
				name: 'currentBlock',
				value: Long.fromBigInt(123n),
			}),
		});

		const result = await useCase.execute();
		expect(result.content).toBeInstanceOf(State);
	});

	/*unit-tests*/
});
