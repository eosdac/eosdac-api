export function loadConfig() {
	const config_name = process.env.CONFIG ? process.env.CONFIG : '';
	if (!config_name) {
		throw new Error(
			`Config not specified, please provide CONFIG environmental variable`
		);
	}
	const config = require(`../${config_name}.config`);

	config.name = config_name;

	return config;
}

export const loadDacConfig = async (fastify, dacId) => {
	const global_config = loadConfig();
	const dac_config_cache = fastify.dac_cache_get(dacId);
	if (dac_config_cache) {
		fastify.log.info(`Returning cached dac info`);
		return dac_config_cache;
	} else {
		const res = await fastify.eos.rpc.get_table_rows({
			code: global_config.eos.dacDirectoryContract,
			scope: global_config.eos.dacDirectoryContract,
			table: 'dacs',
			lower_bound: dacId,
			upper_bound: dacId,
		});

		if (res.rows.length) {
			const row = res.rows[0];
			if (row.dac_id === dacId) {
				const account_map = new Map();
				row.accounts.forEach(acnt => {
					account_map.set(acnt.key, acnt.value);
				});
				row.accounts = account_map;

				const ref_map = new Map();
				row.refs.forEach(ref => {
					ref_map.set(ref.key, ref.value);
				});
				row.refs = ref_map;
				fastify.dac_name_cache.set(dacId, row);

				return row;
			}
		}

		fastify.log.warn(`Could not find dac with ID ${dacId}`);
		return null;
	}
};
