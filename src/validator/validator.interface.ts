import { Request, ValidationResult } from '@alien-worlds/aw-core';
export interface Validator {
  /**
   *
   * @param {Object} jsonSchema - JSON schema object
   * @param {Object} data - Data object to validate
   * @returns {boolean} `true` for valid data, otherwise `false`
   */
  validate(jsonSchema: object, data: object): boolean;

  /**
   *
   * @param {Object} jsonSchema - JSON schema object
   * @param {Request} request - HTTP request to validate
   * @returns {ValidationResult}
   */
  validateHttpRequest(jsonSchema: object, request: Request): ValidationResult;

  /**
   * @param {Object} jsonSchema - JSON schema object
   * @param {Object} data - Data object to validate
   * @throws {Error}
   * @returns {void}
   */
  assert(jsonSchema: object, data: object): void;

  /**
   *
   * @returns {string[]} array of user friendly validation error messages
   */
  readonly errors: string[];
}
