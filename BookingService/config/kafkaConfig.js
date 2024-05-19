// Connect to Kafka
const { Kafka } = require('kafkajs')

const kafkaa = new Kafka({
    clientId: 'bookings',
    brokers: ['127.0.0.1:9092']
});

const consumer = kafkaa.consumer({ groupId: 'bookings' });

module.exports = {
    consumer
};