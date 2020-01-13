# eosDAC API

Provides DAC specific api endpoints for use by the eosdac-client.

## Requirements

- RabbitMQ ([Install](https://www.rabbitmq.com/download.html))
- Available State History node
- MongoDB
- NodeJS v12

## Components

The `eosdac-api` consists of 4 components

### Filler

This reads from the state history node and can be run in parallel to process many streams during replay.  The filler listens for interested contracts specified in the config file and if detected, the transaction is put into a queue for later processing from the binary.

It only processes enough of a given transaction instead of deserialising all of the payload to save cpu cycles.

### Block Range Processor

When the filler is started with the `-r` flag, it will split the replay range into many block ranges and put them on the queue.

This process monitors this queue and pulls a range of blocks from the state history.

### Processor

The processor reads interested jobs from the queue and extracts the data for indexing in mongodb.

The processor will also trigger any registered watchers after processing a state delta or action receipt.

### API

The API service uses fastify to provide a fast API development platform, it reads data from mongodb.

Once running the api will open the configured port and provide document on http://your.domain/v1/eosdac/docs

## Configuring

Each config is named [name].config.js, copy `example.config.js` to your name of choice, eg. `cp example.config.js jungle.config.js`

Edit your file to include the correct contract names and endpoints.  `amq.connectionString` is your your RabbitMQ connection string.

## Starting

The eosdac-api is started using pm2.  Install it globally using `sudo npm i -g pm2` and then configure `ecosystem.config.js`, this file will configure how many processes will start and what configuration file they will use.

`pm2 start` will start all the processes listed in the ecosystem.config.js file.

## Replaying

If you are deploying the api after your contracts have been deployed or you need to refill your database, run the filler directly using the `-r` flag:

`CONFIG=jungle ./eosdac-filler.js -r`

You can also use the `-s` flag to specify a replay with a start block (so you don't have to start from block 0):

`CONFIG=jungle ./eosdac-filler.js -r -s 25629516`

Replays will spawn a number of processes to pull blocks from the chain, if you want to run more filler processes on another machine,
you can start with the blockrange process using pm2 (it should be started automatically).

`pm2 start --only eosdac-blockrange-jungle`

## API WebSocket

The eosdac-ws process opens a websocket which can be used by external clients to listen 
for messages about significant events.

Connect to the websocket server, eosDAC provides endpoints at the following locations:

`ws://api.eosdac.io:3030` - EOS Mainnet
`ws://api-jungle.eosdac.io:3030` - Jungle Network

This example will connect and request notifications for a particular DAC ID

```
const endpoint = 'ws://api.eosdac.io:3030';
const dac_id = 'eosdac';
const ws = new WebSocket(endpoint);
ws.onmessage = (msg) => {
    console.log('Received message', msg.data);
};
ws.onopen = () => {
    console.log(`Websocket opened to ${endpoint}`);
    ws.send(JSON.stringify({type:'register', data:{dac_id}}));
    console.log(`Sent register message for ${dac_id}`);
};
```

The following notifications are sent

## Multisig proposals
```
MSIG_PROPOSED
MSIG_APPROVED
MSIG_UNAPPROVED
MSIG_CANCELLED
MSIG_EXECUTED
```
## Voting and Elections

```
VOTES_CHANGED
NEW_PERIOD
```
