import {
	WorkerProposal,
	WorkerProposalDocument,
} from '@alien-worlds/eosdac-api-common';

import { removeUndefinedProperties } from '@alien-worlds/api-core';

export class ProposalsInboxOutput {
	public static create(
		results?: WorkerProposal[],
		count?: number
	): ProposalsInboxOutput {
		return new ProposalsInboxOutput(results || [], count || 0);
	}

	private constructor(
		public readonly results: WorkerProposal[],
		public readonly count: number
	) {}

	public toJson() {
		const { results, count } = this;

		const result = {
			results: results.map(e => this.parseWorkerProposalToResult(e)),
			count,
		};

		return removeUndefinedProperties<WorkerProposalDocument>(result);
	}

	/**
	 * Get Json object from the entity
	 *
	 * @returns {object}
	 */
	private parseWorkerProposalToResult(proposal: WorkerProposal) {
		const { dacId, status, approveVoted, finalizeVoted } = proposal;

		const dto: WorkerProposalDocument = {
			dacId,
			finalizeVoted,
			approveVoted,
			status,
		};

		return removeUndefinedProperties<WorkerProposalDocument>(dto);
	}
}
