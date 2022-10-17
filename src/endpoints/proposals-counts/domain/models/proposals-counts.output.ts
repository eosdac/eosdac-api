import { removeUndefinedProperties } from '@alien-worlds/api-core';
import { WorkerProposal } from '@alien-worlds/eosdac-api-common';

export class ProposalsCountsOutput {
	public static create(proposals?: WorkerProposal[]): ProposalsCountsOutput {
		return new ProposalsCountsOutput(proposals);
	}

	private constructor(public readonly proposals: WorkerProposal[]) {}

	public toJson() {
		const result = {
			count: this.proposals ? this.proposals.length : 0,
		};

		return removeUndefinedProperties<object>(result);
	}
}
