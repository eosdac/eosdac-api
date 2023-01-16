import { ObjectId } from "mongodb";

export enum VoteAction {
	Voted = 'voted',
	Unvoted = 'unvoted',
	Refreshed = 'refreshed',
}


export type UserVotingHistoryDocument = {
	_id?: ObjectId;
	dac_id: string;
	voter: string;
	vote_timestamp: Date;
	action: VoteAction;
	candidate: string;
	candidate_vote_power: number;
	[key: string]: unknown;
};

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
