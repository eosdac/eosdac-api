import {
	GetRoute,
	Request,
	Result,
	RouteHandler,
} from '@alien-worlds/api-core';

import { ProposalsCountsInput } from '../domain/models/proposals-counts.input';
import { ProposalsCountsOutput } from '../domain/models/proposals-counts.output';

/*imports*/

/**
 * @class
 *
 *
 */
export class GetProposalsCountsRoute extends GetRoute {
	public static create(handler: RouteHandler) {
		return new GetProposalsCountsRoute(handler);
	}

	private constructor(handler: RouteHandler) {
		super('/v1/eosdac/proposals_counts', handler, {
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
export const parseRequestToControllerInput = (request: Request) => {
	// parse DTO (query) to the options required by the controller method
	return ProposalsCountsInput.fromRequest(request.query || {});
};

/**
 *
 * @param {Result<ProposalsCountsOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
	result: Result<ProposalsCountsOutput>
) => {
	if (result.isFailure) {
		const {
			failure: { error },
		} = result;
		if (error instanceof Error) {
			return {
				status: 200,
				body: ProposalsCountsOutput.create().toJson(),
			};
		}

		return {
			status: 500,
			body: 'Server error',
		};
	}

	const { content } = result;

	return {
		status: 200,
		body: content,
	};
};
