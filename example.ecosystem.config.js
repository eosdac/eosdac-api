module.exports = {
    apps: [
        {
            name: "eosdac-filler-jungle",
            script: "./eosdac-filler.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600,
            env: {
                'CONFIG': 'jungle'
            }
        },
        {
            name: "eosdac-blockrange-jungle",
            script: "./eosdac-blockrange.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600,
            env: {
                'CONFIG': 'jungle'
            }
        },
        {
            name: 'eosdac-processor-jungle',
            script: "./eosdac-processor.js",
            autorestart: true,
            env: {
                'CONFIG': 'jungle'
            },
            "pmx": false
        },
        {
            name: 'eosdac-api-jungle',
            script: "./eosdac-api.js",
            autorestart: true,
            env: {
                'CONFIG': 'jungle',
                'SERVER_PORT': 8383,
                'SERVER_ADDR': '0.0.0.0',
                'HOST_NAME': 'api-jungle.eosdac.io'
            },
            "pmx": false
        },
        {
            name: 'eosdac-ws-jungle',
            script: "./eosdac-ws.js",
            autorestart: true,
            env: {
                'CONFIG': 'jungle'
            },
            "pmx": false
        },


        // MAINNET
        {
            name: "eosdac-filler-mainnet",
            script: "./eosdac-filler.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600,
            env: {
                'CONFIG': 'mainnet'
            }
        },
        {
            name: "eosdac-blockrange-mainnet",
            script: "./eosdac-blockrange.js",
            node_args: ["--max-old-space-size=8192"],
            autorestart: true,
            kill_timeout: 3600,
            env: {
                'CONFIG': 'mainnet'
            }
        },
        {
            name: 'eosdac-processor-mainnet',
            script: "./eosdac-processor.js",
            autorestart: true,
            env: {
                'CONFIG': 'mainnet'
            },
            "pmx": false
        },
        {
            name: 'eosdac-api-mainnet',
            script: "./eosdac-api.js",
            autorestart: true,
            env: {
                'CONFIG': 'mainnet',
                'SERVER_PORT': 8382,
                'SERVER_ADDR': '0.0.0.0',
                'HOST_NAME': 'api.eosdac.io'
            },
            "pmx": false
        },
        {
            name: 'eosdac-ws-mainnet',
            script: "./eosdac-ws.js",
            autorestart: true,
            env: {
                'CONFIG': 'mainnet'
            },
            "pmx": false
        }
    ]
};
