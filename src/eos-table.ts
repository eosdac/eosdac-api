/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-async-promise-executor */
import { MongoDB } from '@alien-worlds/api-core';

export async function eosTableAtBlock({
	db,
	code,
	table,
	scope = '',
	skip = 0,
	limit = 100,
	data_query = {},
	block_num = -1,
	block_timestamp = null,
	exclude_scope = false,
}) {
	return new Promise(async (resolve, reject) => {
		const col = db.collection('contract_rows');

		const pipeline_id: any = {
			code: '$code',
			table: '$table',
			primary_key: '$primary_key',
		};

		const match: any = { code, table };
		if (scope) {
			match.scope = scope;
		}
		if (!exclude_scope) {
			pipeline_id.scope = '$scope';
		}
		if (block_num > -1) {
			match.block_num = { $lte: MongoDB.Long.fromString(block_num + '') };
		}
		if (block_timestamp) {
			match.block_timestamp = { $lte: block_timestamp };
		}

		const second_match = { present: 1 };

		for (const col in data_query) {
			second_match['data.' + col] = data_query[col];
		}

		const pipeline = [
			{ $match: match },
			{ $sort: { block_num: -1, present: -1 } },
			{
				$group: {
					_id: pipeline_id,
					block_num: { $first: '$block_num' },
					data: { $first: '$data' },
					table: { $first: '$table' },
					code: { $first: '$code' },
					scope: { $first: '$scope' },
					primary_key: { $first: '$primary_key' },
					present: { $first: '$present' },
				},
			},
			{ $match: second_match },
			{ $sort: { block_num: -1 } },
			{
				$facet: {
					results: [{ $skip: skip }, { $limit: limit }],
					count: [{ $count: 'count' }],
				},
			},
		];

		const filter = (results) => {
			results.forEach(doc => {
				doc.results = doc.results.map(result => {
					delete result._id;
					delete result.present;

					return result;
				});
				doc.count = doc.count.length ? doc.count[0].count : 0;
				resolve(doc);
			});
		};

		try {
			filter(await col.aggregate(pipeline, { allowDiskUse: true }));
		} catch (e) {
			console.error(e);
		}
	});
}

export class eosTableIter {
	code: any;
	scope: any;
	table: any;
	api: any;
	greed_factor: any;
	primary_key: any;
	current_set: any;
	current_pos: number;
	chunk_size: number;
	has_more: boolean;
	unique_index: Set<any>;

	constructor({ code, scope, table, api, greed_factor, primary_key }) {
		if (greed_factor > 19) {
			throw new Error(`greed_factor must be less than 20`);
		}
		this.code = code;
		this.scope = scope;
		this.table = table;
		this.api = api;
		this.greed_factor = greed_factor;
		this.primary_key = primary_key;
		this.current_set = [];
		this.current_pos = 0;
		this.chunk_size = 500;
		this.has_more = false;
		this.unique_index = new Set();
	}

	[Symbol.asyncIterator]() {
		return {
			next: () => {
				return new Promise((resolve, reject) => {
					if (
						!this.current_set.length ||
						(this.current_pos >= this.current_set.length && this.has_more)
					) {
						// fastify.log.info('Fetching table data...', {code:this.code, scope:this.scope, table:this.table});
						const req: any = {
							code: this.code,
							scope: this.scope,
							table: this.table,
							limit: this.chunk_size,
						};
						if (this.current_set.length) {
							req.lower_bound =
								this.current_set[this.current_set.length - this.greed_factor][
								this.primary_key
								];
						}

						this.api.rpc.get_table_rows(req).then(res => {
							if (res.rows && res.rows.length) {
								if (this.current_set.length) {
									for (let i = 0; i < this.greed_factor; i++) {
										res.rows.shift();
									}
								}
								this.current_set = res.rows;
								this.has_more = res.more;
								this.current_pos = 0;
								resolve({ value: this.current_set[this.current_pos++] });
							} else {
								resolve({ done: true });
							}
						});
					} else if (
						!this.has_more &&
						this.current_pos >= this.current_set.length
					) {
						resolve({ done: true });
					} else {
						let next = this.current_set[this.current_pos++];
						if (this.primary_key) {
							while (this.unique_index.has(next[this.primary_key])) {
								next = this.current_set[this.current_pos++];
							}
						}

						resolve({ value: next });
					}
				});
			},
		};
	}
}
