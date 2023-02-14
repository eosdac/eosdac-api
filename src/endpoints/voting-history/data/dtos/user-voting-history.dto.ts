export enum VoteAction {
	Voted = 'voted',
	Unvoted = 'unvoted',
	Refreshed = 'refreshed',
}

export type VotingHistoryRequestDto = {
	dacId: string;
	voter: string;
	skip?: number;
	limit?: number;
};

export type VotingHistoryOutputItem = {
	dacId: string;
	voter: string;
	voteTimestamp: Date;
	candidate: string;
	candidateVotePower: number;
	action: VoteAction;
}

export type VotingHistoryOutput = {
	results: VotingHistoryOutputItem[];
	count: number;
};
