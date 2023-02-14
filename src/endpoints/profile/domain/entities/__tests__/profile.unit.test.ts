import { ContractActionDocument, MongoDB } from '@alien-worlds/api-core';

import { DaoWorldsContract } from '@alien-worlds/eosdac-api-common';
import { Profile } from '../profile';

/*imports*/
/*mocks*/

const profileDto: ContractActionDocument<DaoWorldsContract.Actions.Types.StprofileDocument> = {
    block_num: MongoDB.Long.ZERO,
    action: {
        authorization: null,
        account: 'dao.worlds',
        name: 'stprofile',
        data: {
            cand: 'awtesteroo12',
            profile:
                '{"givenName":"awtesteroo12 name","familyName":"awtesteroo12Family Name","image":"https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png","description":"Here\'s a description of this amazing candidate with the name: awtesteroo12.\\n And here\'s another line about something."}',
            dac_id: 'testa',
        },
    },
};

describe('Profile unit tests', () => {
    it('Profile.fromDto should return Profile object based on the provided dto', async () => {
        const profile = Profile.fromDto(profileDto);

        expect(profile).toBeInstanceOf(Profile);
    });

    it('"toDto" should return a dto based on entity', async () => {
        const profile = Profile.fromDto(profileDto);

        expect(profile.toDto()).toEqual({
            block_num: MongoDB.Long.ZERO,
            action: {
                account: 'dao.worlds',
                name: 'stprofile',
                data: {
                    cand: 'awtesteroo12',
                    profile: {
                        description:
                            "Here's a description of this amazing candidate with the name: awtesteroo12.\n" +
                            " And here's another line about something.",
                        familyName: 'awtesteroo12Family Name',
                        givenName: 'awtesteroo12 name',
                        image:
                            'https://support.hubstaff.com/wp-content/uploads/2019/08/good-pic.png',
                    },
                },
            },
        });
    });

    /*unit-tests*/
});