

function loadConfig(){
    const config_name = (process.env.CONFIG)?process.env.CONFIG:'jungle'
    const config = require(`./${config_name}.config`)

    return config
}

module.exports = {loadConfig}
