# Installing

Clone the repository

`git clone https://github.com/eosdac/eosdac-filler.git`

Change to the correct directory

`cd eosdac-filler/`

This requires the development branch of eosjs

`git submodule update --init --recursive`

`cd eosjs`

*You will need node version 10*

`npm i`

Install the dependencies for the filler

`cd ..`

`npm i`

# Configuring

Copy the example config file to a name of your choice

`cp example.config.js jungle.config.js`

Then edit the config file with the correct settings.

# Starting

## Filler

The filler process receives blocks from the websocket and will push them to a redis queue.

To start the filler, you will need to increase the memory limit, start it using the config name you used earlier.

`nodejs --max-old-space-size=8192 eosdac-filler.js -c <config_name> &`

This will start the block filler and log output to filler.log

## Processor

This process will take tasks from the queue and process them, storing in mongo where necessary.  It will process 2 types
of message, `block_traces` which contains an entire block and `action` which contains a single action.  When the
processor receives a `block_traces` message, it will read all of the actions from the block and create a new `action`
queue item.  When it receives an `action` message it will store the action in the mongo datastore.

To start, run the file directly and append the same config file

`./eosdac-processor.js -c <config_name>`

