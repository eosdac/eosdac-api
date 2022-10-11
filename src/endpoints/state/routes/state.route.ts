import { GetRoute, Result, RouteHandler } from '@alien-worlds/api-core';

import { GetStateOutput } from '../domain/models/get-state-output';

/*imports*/

/**
 * @class
 *
 *
 */
export class GetStateRoute extends GetRoute {
	public static create(handler: RouteHandler) {
		return new GetStateRoute(handler);
	}

	private constructor(handler: RouteHandler) {
		super('/v1/eosdac/state', handler, {
			hooks: {
				post: parseResultToControllerOutput,
			},
		});
	}
}

/**
 *
 * @param {Result<GetStateOutput>} result
 * @returns
 */
export const parseResultToControllerOutput = (
	result: Result<GetStateOutput>
) => {
	if (result.isFailure) {
		const {
			failure: { error },
		} = result;
		if (error instanceof Error) {
			return {
				status: 200,
				body: GetStateOutput.create().toJson(),
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
		body: content.toJson(),
	};
};
