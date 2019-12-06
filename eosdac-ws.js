#!/usr/bin/env node

process.title = 'eosdac-ws';

const {loadConfig} = require('./functions');

const cluster = require('cluster');
const WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require('fs');

const {IPC} = require('node-ipc');
const workers = [], connections = [], connections_idx = new Map();

const config = loadConfig();

const receiveWSMessage = (connection) => {
    // Receive register request from ws client
    return (message) => {
        if (message.type === 'utf8') {
            try {
                const msg = JSON.parse(message.utf8Data);
                console.log('Received websocket request: ' + message.utf8Data, msg);
                switch (msg.type){
                    case 'register':
                        const dac_id = msg.data.dac_id;
                        if (!dac_id){
                            throw new Error(`dac_id not supplied`);
                        }

                        // add to index by dac_id
                        let existing = connections_idx.get(dac_id);
                        if (!existing){
                            existing = [];
                        }
                        existing.push(connection);
                        connections_idx.set(dac_id, existing);
                        break;
                    default:
                        throw new Error(`Unknown message type : ${msg.type}`);
                        break;
                }
                // connection.sendUTF(message.utf8Data);
            }
            catch (e){
                console.log(`Error in message, closing connection ${e.message}`);
                connection.close();
            }

        }
    }
};

const receiveIPCMessage = (ipc, type) => {
    // IPC message from one of the connected clients, relay to workers who will send to connected clients
    return (data, socket) => {
        console.log(`Got data to websocket IPC server of type ${type}, notifying workers`, data);

        workers.forEach((w) => {
            w.send({type, data});
        });
    };
};

const receiveWorkerMessage = (msg) => {
    console.log(`Worker got message, sending to interested websocket clients`, msg);
    // find which connections are interested and send to them
    const dac_id = msg.data.dac_id;
    if (dac_id){
        const notify = connections_idx.get(dac_id);
        if (notify && notify.length){
            notify.forEach((conn) => {
                conn.send(JSON.stringify(msg));
            });
        }
        const notify_all = connections_idx.get('*');
        if (notify_all && notify_all.length){
            notify_all.forEach((conn) => {
                conn.send(JSON.stringify(msg));
            });
        }
    }
};


const startWSServer = (host = '127.0.0.1', port = 3030) => {
    console.log(`Starting HTTP server for websocket status server`);
    const sendIndex = (response) => {
        response.writeHead(200, {
            "Content-Type": "text/html"
        });
        fs.createReadStream("static/ws-test.html").pipe(response);
    };


    const server = http.createServer(function(request, response) {
        // send test page
        sendIndex(response);
    });
    server.listen(port, host, () => {
        console.log(`Started http/websocket server on ${host}:${port}`);
    });

    // create the server
    const wsServer = new WebSocketServer({
        httpServer: server
    });

    // WebSocket server
    wsServer.on('request', (request) => {
        // console.log(`Got request`, req.message.utf8Data, data);
        const connection = request.accept();
        connections.push(connection);

        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', receiveWSMessage(connection));
    });
};

const startIPCServer = () => {
    const ipc = new IPC();
    ipc.config.appspace = 'eosdac.';
    ipc.config.id = 'livenotifications';
    ipc.serve(() => {
        console.log(`Started IPC Server`);
        ipc.server.on('notification', receiveIPCMessage(ipc, 'notification'));
    });
    ipc.server.start();
};




// Start the server and workers
const process_count = 4;

if (cluster.isMaster){
    for (let i=0;i<process_count;i++){
        const worker = cluster.fork();
        workers.push(worker);
    }

    // start ipc server for other processes to notify websockets
    startIPCServer();
}
else {
    console.log(`Starting worker`);
    console.log(config.ws);
    startWSServer(config.ws.host, config.ws.port);

    process.on('message', receiveWorkerMessage);

}