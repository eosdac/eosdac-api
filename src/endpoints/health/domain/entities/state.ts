import { MongoDB, parseToBigInt, removeUndefinedProperties } from '@alien-worlds/api-core';

import { StateDocument } from '../../data/dtos/state.dto';

/*imports*/
/**
 * Represents State data entity.
 * @class
 */
export class State {
    /**
     * @private
     * @constructor
     */
    private constructor(public readonly currentBlock: bigint) { }

    /**
     * Create DTO based on entity data
     *
     * @returns {StateDocument}
     */
    public toDto(): StateDocument {
        const dto = {
            name: 'currentBlock',
            value: MongoDB.Long.fromBigInt(this.currentBlock),
        };

        return removeUndefinedProperties<StateDocument>(dto);
    }

    /**
     * Creates instances of State based on a given DTO.
     *
     * @static
     * @public
     * @param {StateDocument} dto
     * @returns {State}
     */
    public static fromDto(dto: StateDocument): State {
        const { value } = dto;
        return new State(parseToBigInt(value));
    }
}
