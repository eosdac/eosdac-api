const {membertermsSchema} = require('../schemas');
const fetch = require('node-fetch');


async function getMemberTerms(fastify, request) {
    // console.log(request)
      const api = fastify.eos.api;

      const dac_config = await request.dac_config();
      const dac_id = request.dac();
      const token_contract = dac_config.symbol.contract;
      const cust_res = await api.rpc.get_table_rows({code:token_contract, scope:dac_id, table:'memberterms'});
      const terms = cust_res.rows[0];
      console.log(`getMemberTerms: ${terms}`);
      const url = terms.terms;
      const res = await fetch(url);
      const body = await res.text();
      return body;
}


module.exports = function (fastify, opts, next) {
    fastify.get('/memberterms',
    async (request, reply) => {
        reply.send(await getMemberTerms(fastify, request));
    });
    next()
};

