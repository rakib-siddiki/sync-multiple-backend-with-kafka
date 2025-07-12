import { Kafka, Producer, logLevel } from "kafkajs";
import { KafkaMessage } from "./types";
import { Logger } from "./logger";

export class KafkaProducer {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger: Logger;
  private isConnected: boolean = false;

  constructor(brokers: string[], clientId: string, logger: Logger) {
    this.logger = logger;
    this.kafka = new Kafka({
      clientId,
      brokers,
      logLevel: logLevel.WARN,
    });
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.info("Kafka producer connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect Kafka producer", { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      this.logger.info("Kafka producer disconnected");
    } catch (error) {
      this.logger.error("Failed to disconnect Kafka producer", { error });
      throw error;
    }
  }

  async sendMessage(message: KafkaMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Kafka producer is not connected");
    }

    try {
      await this.producer.send({
        topic: message.topic,
        messages: [
          {
            partition: message.partition,
            key: message.key,
            value: message.value,
            timestamp: message.timestamp,
            headers: message.headers,
          },
        ],
      });

      this.logger.debug(`Message sent to topic: ${message.topic}`, {
        key: message.key,
        valueLength: message.value.length,
      });
    } catch (error) {
      this.logger.error(`Failed to send message to topic: ${message.topic}`, {
        error,
      });
      throw error;
    }
  }

  async sendBatch(messages: KafkaMessage[]): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Kafka producer is not connected");
    }

    // Group messages by topic
    const messagesByTopic: Record<string, KafkaMessage[]> = {};
    messages.forEach((message) => {
      if (!messagesByTopic[message.topic]) {
        messagesByTopic[message.topic] = [];
      }
      messagesByTopic[message.topic].push(message);
    });

    try {
      const promises = Object.entries(messagesByTopic).map(
        ([topic, topicMessages]) =>
          this.producer.send({
            topic,
            messages: topicMessages.map((msg) => ({
              partition: msg.partition,
              key: msg.key,
              value: msg.value,
              timestamp: msg.timestamp,
              headers: msg.headers,
            })),
          })
      );

      await Promise.all(promises);
      this.logger.debug(
        `Batch of ${messages.length} messages sent successfully`
      );
    } catch (error) {
      this.logger.error("Failed to send batch messages", {
        error,
        batchSize: messages.length,
      });
      throw error;
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}
