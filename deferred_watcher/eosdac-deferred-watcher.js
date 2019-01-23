#!/usr/bin/env node

const WebSocketServer = require('websocket').server
const http = require('http')
const fs = require('fs')
const { JsonRpc } = require('eosjs')
const fetch = require('node-fetch')

const {DeltaHandler} = require('./eosdac-deferred-handler')
const BlockReceiver = require('../eosdac-blockreceiver')

/*
const sendTest = (response) => {
    response.writeHead(200, {
        "Content-Type": "text/html"
    })
    fs.createReadStream("index.html").pipe(response)
}


const server = http.createServer(function(request, response) {
    // send test page
    sendTest(response)
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

let clients = [];
let block_receivers = [];


// WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin);

    const connection = request.accept(null, request.origin);
    const client_id = clients.push(connection) - 1;

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // process WebSocket message
            console.log((new Date()) + ' Received Message : ' + message.utf8Data + ' from client id ' + client_id);

            try {
                const msg_obj = JSON.parse(message.utf8Data)
                console.log(msg_obj)
                if (msg_obj.type === 'generated_transactions'){
                    let config = require('../jungle.config')
                    config.eos.contracts = msg_obj.data.contracts

                    const delta_handler = new DeltaHandler({config, wsclient:clients[client_id]})
                    const br = new BlockReceiver({startBlock:msg_obj.start_block, mode:0, config})
                    br.registerDeltaHandler(delta_handler)
                    br.start()

                    connection.block_receiver = br
                }
            }
            catch (e){
                console.error(e)
            }
        }
    });

    connection.on('close', function(code, reason) {
        // close user connection
        connection.block_receiver.destroy()

        console.log((new Date()) + " Peer  disconnected.");
    });
});
*/

let config = require('../jungle.config')

const rpc = new JsonRpc(config.eos.endpoint, {fetch});

rpc.get_info().then((info) => {
    const lib = info.last_irreversible_block_num

    console.log(`Starting from lib ${lib}`)

    const delta_handler = new DeltaHandler({config})
    const br = new BlockReceiver({startBlock:lib, mode:0, config})
    br.registerDeltaHandler(delta_handler)
    br.start()
})

