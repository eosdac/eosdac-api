import { MongoDB } from "@alien-worlds/api-core";

/**
 * Represents the data structure of the State mongoDB document
 * @type
 */
export type StateDocument = {
    name?: string;
    value?: MongoDB.Long;
};
