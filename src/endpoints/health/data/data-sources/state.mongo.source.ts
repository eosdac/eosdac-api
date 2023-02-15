import { CollectionMongoSource, MongoSource } from '@alien-worlds/api-core';

import { StateDocument } from '../dtos/state.dto';

/*imports*/
/**
 * @class
 */
export class StateMongoSource extends CollectionMongoSource<StateDocument> {
    public static Token = 'STATE_MONGO_SOURCE';

    /**
     * @constructor
     * @param {MongoSource} mongoSource
     */
    constructor(mongoSource: MongoSource) {
        super(mongoSource, 'state');
    }

    /*methods*/

    /**
     * Get current block from state
     *
     * @param
     * @returns {Promise<StateDocument>}
     */
    public async getCurrentBlock(): Promise<StateDocument> {
        return this.findOne({ filter: { name: 'current_block' } });
    }
}
