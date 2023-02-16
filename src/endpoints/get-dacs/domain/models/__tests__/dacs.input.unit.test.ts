

/*imports*/

import { GetDacsInput } from "../dacs.input";
import { GetDacsRequestDto } from "../../../../get-dacs/data/dtos/dacs.dto";
import { Request } from '@alien-worlds/api-core';

/*mocks*/
const input = {
	query: {
		dacId: 'nerix',
		limit: 100,
	},
};

describe('GetDacsInput Unit tests', () => {
	it('"GetDacsInput.fromRequest" should create instance', async () => {
		const fromReq = GetDacsInput.fromRequest(input as Request<GetDacsRequestDto>);

		expect(fromReq).toBeInstanceOf(GetDacsInput);
	});

	it('GetDacsInput instance should have proper dacId value', async () => {
		const fromReq = GetDacsInput.fromRequest(input as Request<GetDacsRequestDto>);

		expect(fromReq.dacId).toBe(input.query.dacId)
	});

	it('GetDacsInput instance should have proper limit value', async () => {
		const fromReq = GetDacsInput.fromRequest(input as Request<GetDacsRequestDto>);

		expect(fromReq.limit).toBe(input.query.limit)
	});

	/*unit-tests*/
});
