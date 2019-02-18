const Amqp = require('amqplib')

class RabbitSender {
    constructor (channel, config) {
        this.channel = channel
        this.config = config
    }

    static async init (config) {
        const conn = await Amqp.connect(config.connectionString)
        conn.on('error', function (err) {
            if (err.message !== 'Connection closing') {
                console.error('[AMQP] conn error', err.message)
            }
        })
        conn.on('close', function () {
            console.error('[AMQP] closing')
        })

        const channel = await conn.createChannel()
        channel.assertQueue('block_range', {durable: true})
        channel.assertQueue('contract_row', {durable: true})
        channel.assertQueue('permission_link', {durable: true})

        return new RabbitSender(channel, config)
    }

    async send (queue_name, msg) {
        if (!Buffer.isBuffer(msg)){
            msg = Buffer.from(msg)
        }

        return this.channel.sendToQueue(queue_name, msg)
    }

    async listen (queue_name, cb){
        this.channel.prefetch(1)
        // await this.channel.assertQueue(queue_name, {durable: true})
        this.channel.consume(queue_name, cb, { noAck: false })
    }

    async ack (job){
        return this.channel.ack(job)
    }

    async reject (job){
        return this.channel.reject(job, true)
    }
}

module.exports = RabbitSender
