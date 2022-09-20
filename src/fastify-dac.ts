const fp = require('fastify-plugin');

import { config } from './config';
import { DacDirectory } from './dac-directory';

const tokenInfo = require('../tokens.json');

module.exports = fp(
	(fastify: any, options, next) => {
		fastify.decorate('dac_name_cache', new Map());
		fastify.decorate('dac_cache_get', function (dac_name) {
			return this.dac_name_cache.get(dac_name);
		});
		fastify.decorateRequest('dac', function () {
			return this.headers['x-dac-name'] || config.eos.legacyDacs[0];
		});
		fastify.decorateRequest('dac_directory', async function () {
			const dac_directory = new DacDirectory({ config, db: fastify.db });
			await dac_directory.reload();

			return dac_directory;
		});
		fastify.decorateRequest('dac_config', async function () {
			const dac_name = this.dac();
			const dac_config_cache = fastify.dac_cache_get(dac_name);
			if (dac_config_cache) {
				fastify.log.info(`Returning cached dac info`);
				return dac_config_cache;
			} else {
				const res = await fastify.eos.rpc.get_table_rows({
					code: config.eos.dacDirectoryContract,
					scope: config.eos.dacDirectoryContract,
					table: 'dacs',
					lower_bound: dac_name,
					upper_bound: dac_name,
				});

				if (res.rows.length) {
					const row = res.rows[0];
					if (row.dac_id === dac_name) {
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
						fastify.dac_name_cache.set(dac_name, row);

						return row;
					}
				}

				fastify.log.warn(`Could not find dac with ID ${dac_name}`);
				return null;
			}
			//return this.headers['x-dac-name'] || 'eosdac';
		});

		fastify.decorate('tokens', function () {
			const token_map = new Map();
			tokenInfo.forEach(ti => {
				token_map.set(`${ti.account}:${ti.symbol}`, ti);
			});
			return token_map;
		});

		next();
	},
	{
		fastify: '>=1.0.0',
		name: 'fastify-dac',
	}
);
