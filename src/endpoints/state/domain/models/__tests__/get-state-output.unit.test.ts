import { State, StateDocument } from '@alien-worlds/eosdac-api-common';

import { GetStateOutput } from '../get-state-output';
import { Long } from 'mongodb';

const stateDocument: StateDocument = {
	name: 'currentBlock',
	value: Long.fromBigInt(123n),
};

describe('GetStateOutput Unit tests', () => {
	it('"toJson" should create controller output data as JSON', async () => {
		const output = GetStateOutput.create(State.fromDto(stateDocument));
		expect(output.toJson()).toEqual({
			currentBlock: 123,
		});
	});
});
