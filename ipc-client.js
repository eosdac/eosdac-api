
const {IPC} = require('node-ipc');

class IPCClient {
    constructor (config) {
        this.ipc = new IPC();
        this.ipc.config.appspace = config.appspace;
        this.ipc.connectTo(config.id, async () => {
            console.log(`Connected to IPC ${config.appspace}${config.id}`);
        });
    }

    send_notification (msg) {
        console.log(`Sending IPC notification`, msg);
        this.ipc.of.livenotifications.emit('notification', msg);
    }
}

module.exports = IPCClient;
