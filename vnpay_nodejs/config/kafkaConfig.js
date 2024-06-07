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

module.exports = {
  producer,
  startProducer
}