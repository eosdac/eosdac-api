import { Request, ValidationResult } from '@alien-worlds/api-core';

import Ajv2020 from 'ajv/dist/2020';
import { ErrorObject } from 'ajv';
import { Validator } from './validator.interface';

export class AjvValidator implements Validator {
  private constructor(private readonly _ajv: Ajv2020) {}

  public static initialize(): Validator {
    const validationOptions = {
      allErrors: true,
      verbose: true,
      coerceTypes: true,
    };

    return new AjvValidator(new Ajv2020(validationOptions));
  }

  validate(schema: object, data: object): boolean {
    return this._ajv.validate(schema, data);
  }

  validateHttpRequest(
    jsonSchema: object,
    request: Request<unknown>
  ): ValidationResult {
    const valid = this.validate(jsonSchema, request);

    return {
      valid,
      message: !valid ? 'bad request' : '',
      errors: this.errors,
    };
  }

  assert(schema: object, data: object): void {
    if (!this.validate(schema, data)) {
      throw new Error(this._ajv.errorsText());
    }
  }

  get errors(): string[] {
    return this._ajv.errors?.map(this.humanizeAjvError) || [];
  }

  private humanizeAjvError(err: ErrorObject): string {
    return `${err.instancePath} ${err.message}`;
  }
}
