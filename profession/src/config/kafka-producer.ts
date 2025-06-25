import { Kafka } from "kafkajs";

export const kafkaProducerClient = new Kafka({
  clientId: process.env.KAFKA_PRODUCER_CLIENT_ID!,
  brokers: [process.env.KAFKA_BROKER!],
});


