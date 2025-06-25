import { Kafka } from "kafkajs";

export const kafkaConsumerClient = new Kafka({
  clientId: process.env.KAFKA_CONSUMER_CLIENT_ID!,
  brokers: [process.env.KAFKA_BROKER!],
});

