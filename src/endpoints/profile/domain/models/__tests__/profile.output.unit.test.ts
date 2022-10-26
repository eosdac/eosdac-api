import { DeserializedAction } from '@alien-worlds/eosdac-api-common';
import { Long } from '@alien-worlds/api-core';
import { Profile } from '../../entities/profile';
import { ProfileOutput } from '../profile.output';

/*imports*/
/*mocks*/
const workerProposals: Profile[] = [
	Profile.fromDto({
		action: <DeserializedAction>{
			data: {
				cand: 'string',
				profile: `{"givenName":"awtesteroo12 name",
							"familyName":"awtesteroo12Family Name",
							"image":"image-url","description":"string"}`,
			},
		},
		block_num: Long.ZERO,
	}),
];

describe('ProfileOutput Unit tests', () => {
	it('"ProfileOutput.create" should create instance', async () => {
		const output = ProfileOutput.create(workerProposals);

		expect(output).toBeInstanceOf(ProfileOutput);
	});

	it('ProfileOutput.toJson should return json object', async () => {
		const output = ProfileOutput.create(workerProposals);

		expect(output.toJson()).toBeInstanceOf(Object);
	});

	/*unit-tests*/
});
