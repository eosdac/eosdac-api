import {
	GetRoute,
	Request,
	Result,
	RouteHandler,
} from '@alien-worlds/api-core';
import { GetCandidatesInput } from '../domain/models/get-candidates.input';
import { GetCandidatesOutput } from '../domain/models/get-candidates.output';
import { GetCandidatesRequestDto } from '../data/dtos/candidate.dto';

/*imports*/

/**
 * @class
 *
 *
 */
export class GetCandidatesRoute extends GetRoute {
	public static create(handler: RouteHandler) {
		return new GetCandidatesRoute(handler);
	}

	private constructor(handler: RouteHandler) {
		super(['/v1/dao/:dacId/candidates', '/v1/eosdac/:dacId/candidates'], handler, {
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
 * @returns
 */
export const parseRequestToControllerInput = (
	request: Request<GetCandidatesRequestDto>
) => {
	// parse DTO (query) to the options required by the controller method
	return GetCandidatesInput.fromRequest(request);
};

/**
 *
 * @param {Result<GetCandidatesOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
	result: Result<GetCandidatesOutput>
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
