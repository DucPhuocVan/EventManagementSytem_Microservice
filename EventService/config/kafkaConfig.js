// Connect to Kafka
const { Kafka } = require('kafkajs')

const kafkaa = new Kafka({
    clientId: 'events',
    brokers: ['127.0.0.1:9092']
});

const producer = kafkaa.producer();

// Start the Kafka producer
async function startProducer() {
  await producer.connect();
}

const consumer_payment = kafkaa.consumer({ groupId: 'payment_failed' });

const consumer_booking_info = kafkaa.consumer({ groupId: 'booking_info' });

module.exports = {
  producer,
  startProducer,
  consumer_payment,
  consumer_booking_info
}