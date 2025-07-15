import { Kafka, Producer } from "kafkajs";
import { kafkaProducerClient } from "./kafka-producer";
import { logger } from "@/utils/logger";

// Default DLQ topic suffix
const DEFAULT_DLQ_SUFFIX = ".dlq";

interface DLQMessage {
  originalTopic: string;
  originalKey: string | null;
  errorMessage: string;
  errorStack?: string;
  timestamp: string;
  payload: any; // Original message payload
  metadata?: Record<string, any>; // Additional metadata
}

class KafkaDLQ {
  private readonly producer: Producer;
  private readonly dlqSuffix: string;
  private initialized: boolean = false;

  constructor(
    client: Kafka = kafkaProducerClient,
    dlqSuffix: string = DEFAULT_DLQ_SUFFIX
  ) {
    this.producer = client.producer();
    this.dlqSuffix = dlqSuffix;
  }

  /**
   * Initialize the DLQ producer
   */
  async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await this.producer.connect();
        this.initialized = true;
        logger.success("DLQ producer connected successfully");
      } catch (error: any) {
        logger.error("Failed to initialize DLQ producer:", error);
        throw new Error(`Failed to initialize DLQ producer: ${error.message}`);
      }
    }
  }

  /**
   * Send a message to the dead letter queue
   * @param originalTopic - Original topic where the message was supposed to be processed
   * @param error - Error that occurred during processing
   * @param message - Original message object or payload
   * @param metadata - Additional metadata about the context
   */
  async sendToDLQ(
    originalTopic: string,
    error: Error,
    message: any,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const dlqTopic = `${originalTopic}${this.dlqSuffix}`;

      // Format the message for the DLQ
      const dlqMessage: DLQMessage = {
        originalTopic,
        originalKey: message.key || null,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString(),
        payload: message.value
          ? typeof message.value === "string"
            ? message.value
            : JSON.stringify(message.value)
          : null,
        metadata,
      };

      // Send to DLQ topic
      await this.producer.send({
        topic: dlqTopic,
        messages: [
          {
            key: message.key || `error-${Date.now()}`,
            value: JSON.stringify(dlqMessage),
            headers: {
              "dlq-reason": Buffer.from(error.message.substring(0, 100)),
              "original-topic": Buffer.from(originalTopic),
              timestamp: Buffer.from(new Date().toISOString()),
            },
          },
        ],
      });

      logger.info(`Message sent to DLQ topic: ${dlqTopic}`, {
        originalTopic,
        errorType: error.name,
        dlqTopic,
      });
    } catch (dlqError: any) {
      // If sending to DLQ fails, we don't want to throw again - just log it
      logger.error(`Failed to send message to DLQ: ${dlqError.message}`, {
        originalError: error.message,
        dlqError: dlqError.message,
      });
    }
  }

  /**
   * Process a message with error handling that sends to DLQ on failure
   * @param topic - The original topic
   * @param messageProcessor - Async function that processes the message
   * @param message - The message to process
   * @param metadata - Additional metadata about the context
   */
  async processWithDLQ<T>(
    topic: string,
    messageProcessor: (message: any) => Promise<T>,
    message: any,
    metadata: Record<string, any> = {}
  ): Promise<T | null> {
    try {
      return await messageProcessor(message);
    } catch (error: any) {
      logger.error(`Error processing message from topic ${topic}:`, error);
      await this.sendToDLQ(topic, error, message, metadata);
      return null;
    }
  }

  /**
   * Close the DLQ producer
   */
  async disconnect(): Promise<void> {
    if (this.initialized) {
      await this.producer.disconnect();
      this.initialized = false;
      logger.info("DLQ producer disconnected");
    }
  }
}

// Singleton instance
export const kafkaDLQ = new KafkaDLQ();

/**
 * Helper function to wrap a message processor with DLQ error handling
 * @param topic - The original topic
 * @param processor - The message processing function
 */
export function withDLQ<T>(
  topic: string,
  processor: (data: any, ...args: any[]) => Promise<T>
) {
  return async (data: any, ...args: any[]): Promise<T | null> => {
    try {
      return await processor(data, ...args);
    } catch (error: any) {
      const messageObj = {
        value: data,
        key: null,
      };

      // Add context from args if possible
      const metadata: Record<string, any> = {};
      if (args && args.length > 0) {
        metadata.processorArgs = args;
      }

      await kafkaDLQ.sendToDLQ(topic, error, messageObj, metadata);
      return null;
    }
  };
}

// Types for better integration with TypeScript consumers
export type MessageProcessor<T> = (message: any) => Promise<T>;
export type DLQWrappedProcessor<T> = (
  data: any,
  ...args: any[]
) => Promise<T | null>;
