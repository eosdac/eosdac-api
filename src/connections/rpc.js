async function getAllTableRows(api, code, scope, table, field) {
    const result = [];
    const query = { code, scope, table, limit: 100 }
    let read = true;

    while (read) {
        let resultSize = result.length;
        if (resultSize > 0) {
            query.lower_bound = result.at(-1)[field];
        }
        const table = await api.rpc.get_table_rows(query);

        if (resultSize === 0) {
            result.push(...table.rows);
        } else if (resultSize > 0 && table.rows.length > 1) {
            result.push(...table.rows.slice(1));
        } else {
            read = false;
        }
    }

    return result;
}


module.exports = getAllTableRows;