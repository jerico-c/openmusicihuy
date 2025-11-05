const amqp = require('amqplib');
const config = require('../../utils/config');

const ProducerService = {
    // Sends a message to RabbitMQ, but won't crash the request if MQ is down.
    sendPlaylistMessage: async (queue, message) => {
        // If MQ server is not configured, log and return gracefully.
        if (!config.rabbitMq.server) {
            console.warn(
                '[ProducerService] RABBITMQ_SERVER is not set. Skipping message send.'
            );
            return;
        }

        let connection;
        try {
            connection = await amqp.connect(config.rabbitMq.server);
            const channel = await connection.createChannel();

            await channel.assertQueue(queue, {
                durable: true,
            });

            await channel.sendToQueue(queue, Buffer.from(message));

            // Close the connection shortly after to free resources.
            setTimeout(() => {
                try {
                    connection.close();
                } catch (e) {
                    // ignore close errors
                }
            }, 500);
        } catch (err) {
            // Do not throw; log and degrade gracefully to keep API responsive.
            console.warn(
                `[ProducerService] Failed to send message to queue "${queue}": ${err.message}`
            );
        }
    },
};

module.exports = ProducerService;
