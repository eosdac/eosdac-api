const fp = require('fastify-plugin');
const {loadConfig} = require('./functions');

module.exports = fp((fastify, options, next) => {
    fastify.decorate('dac_name_cache', new Map());
    fastify.decorateRequest('dac', function () {
        return this.headers['x-dac-name'] || 'eosdac';
    });
    fastify.decorateRequest('dac_config', async function () {
        const global_config = loadConfig();

        const dac_name = this.dac();
        const dac_config_cache = fastify.dac_name_cache.get(dac_name);
        if (dac_config_cache){
            return dac_config_cache;
        }
        else {
            const res = await fastify.eos.rpc.get_table_rows({
                code: global_config.eos.dacDirectoryContract,
                scope: global_config.eos.dacDirectoryContract,
                table: 'dacs',
                lower_bound: dac_name,
                upper_bound: dac_name
            });
            // console.log(res);
            if (res.rows.length){
                const row = res.rows[0];
                if (row.dac_name === dac_name){
                    const account_map = new Map();
                    row.accounts = row.accounts.forEach((acnt) => {
                        account_map.set(acnt.key, acnt.value);
                    });
                    // console.log(account_map);
                    row.accounts = account_map;
                    fastify.dac_name_cache.set(dac_name, row);

                    return row;
                }
            }

            return null;
        }
        //return this.headers['x-dac-name'] || 'eosdac';
    });

    next();
}, {
    fastify: '>=1.0.0',
    name: 'fastify-dac'
});
