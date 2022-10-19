import {
	GetRoute,
	Request,
	Result,
	RouteHandler,
} from '@alien-worlds/api-core';

import { config } from '@config';
import { ProposalsInboxInput } from '../domain/models/proposals-inbox.input';
import { ProposalsInboxOutput } from '../domain/models/proposals-inbox.output';

/*imports*/

/**
 * @class
 *
 *
 */
export class ProposalsInboxRoute extends GetRoute {
	public static create(handler: RouteHandler) {
		return new ProposalsInboxRoute(handler);
	}

	private constructor(handler: RouteHandler) {
		super('/v1/eosdac/proposals_inbox', handler, {
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
	request: Request<ProposalsInboxInput>
) => {
	// parse DTO (query) to the options required by the controller method
	return ProposalsInboxInput.fromRequest({
		...request.query,
		dacId: request.query.dacId || config.eos.legacyDacs[0],
	});
};

/**
 *
 * @param {Result<ProposalsInboxOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
	result: Result<ProposalsInboxOutput>
) => {
	if (result.isFailure) {
		const {
			failure: { error },
		} = result;
		if (error) {
			return {
				status: 500,
				body: ProposalsInboxOutput.create().toJson(),
			};
		}
	}

	const { content } = result;

	return {
		status: 200,
		body: ProposalsInboxOutput.create(content.results, content.count).toJson(),
	};
};
