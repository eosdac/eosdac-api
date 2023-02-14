

/*imports*/

import { GetDacsInput } from "../dacs.input";
import { GetDacsRequestDto } from "../../../../get-dacs/data/dtos/dacs.dto";
import { Request } from '@alien-worlds/api-core';

/*mocks*/
const input = {
	query: {
		scope: 'scope',
		limit: 100,

	},
};

describe('GetDacsInput Unit tests', () => {
	it('"GetDacsInput.fromRequest" should create instance', async () => {
		const fromReq = GetDacsInput.fromRequest(input as Request<GetDacsRequestDto>);

		expect(fromReq).toBeInstanceOf(GetDacsInput);
	});

	it('GetDacsInput instance should have proper scope value', async () => {
		const fromReq = GetDacsInput.fromRequest(input as Request<GetDacsRequestDto>);

		expect(fromReq.scope).toBe('scope')
	});

	it('GetDacsInput instance should have proper limit value', async () => {
		const fromReq = GetDacsInput.fromRequest(input as Request<GetDacsRequestDto>);

		expect(fromReq.limit).toBe(100)
	});

	/*unit-tests*/
});
