import { WorkerProposal } from '@alien-worlds/eosdac-api-common';

export type ProposalsInboxRequestDto = {
	account: string;
	dacId: string;
	skip?: number;
	limit?: number;
};

export type ProposalsInboxOutput = {
	results: WorkerProposal[];
	count: number;
};
