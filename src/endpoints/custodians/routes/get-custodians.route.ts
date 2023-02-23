import { GetRoute, Request, Result, RouteHandler, ValidationResult } from '@alien-worlds/api-core';

import { AjvValidator } from '@src/validator/ajv-validator';
import { CustodiansRequestSchema } from '../schemas';
import { GetCustodiansInput } from '../domain/models/get-custodians.input';
import { GetCustodiansOutput } from '../domain/models/get-custodians.output';
import { GetCustodiansRequestDto } from '../data/dtos/custodian.dto';

/*imports*/

/**
 * @class
 *
 *
 */
export class GetCustodiansRoute extends GetRoute {
	public static create(handler: RouteHandler) {
		return new GetCustodiansRoute(handler);
	}

	private constructor(handler: RouteHandler) {
		super(['/v1/dao/:dacId/custodians', '/v1/eosdac/:dacId/custodians'], handler, {
			validators: {
				request: validateRequest,
			},
			hooks: {
				pre: parseRequestToControllerInput,
				post: parseResultToControllerOutput,
			},
		});
	}
}

/**
 *
 * @param {Request} request
 * @returns {ValidationResult}
 */
export const validateRequest = (request: Request<GetCustodiansRequestDto>): ValidationResult => {
	return AjvValidator.initialize().validateHttpRequest(CustodiansRequestSchema, request);
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (
	request: Request<GetCustodiansRequestDto>
) => {
	// parse DTO (query) to the options required by the controller method
	return GetCustodiansInput.fromRequest(request);
};

/**
 *
 * @param {Result<GetCustodiansOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
	result: Result<GetCustodiansOutput>
) => {
	if (result.isFailure) {
		const {
			failure: { error },
		} = result;
		if (error) {
			return {
				status: 500,
				body: [],
			};
		}
	}

	return {
		status: 200,
		body: result.content.toJson(),
	};
};
