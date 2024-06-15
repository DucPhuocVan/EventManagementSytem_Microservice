// Connect to Kafka
const { Kafka } = require('kafkajs')

const kafkaa = new Kafka({
    clientId: 'bookings',
    brokers: ['127.0.0.1:9092']
});

const producer = kafkaa.producer();

const consumer = kafkaa.consumer({ groupId: 'bookings' });

const consumer_payment = kafkaa.consumer({ groupId: 'payments' });

module.exports = {
    producer,
    consumer,
    consumer_payment
};