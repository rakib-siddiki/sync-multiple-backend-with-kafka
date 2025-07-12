import { branchConsumer } from "@/modules/branch/kafka/branch-consumer";
import { userConsumer } from "@/modules/user/kafka/user-consumer";
import { kafkaConsumerClient } from "./kafka-consumer";
import { orgConsumer } from "@/modules/organization/kafka/organization-consumer";
import { pracConsumer } from "@/modules/practitioner/kafka/practitioner-consumer";
import { pracInfoConsumer } from "@/modules/practitioner/kafka/practitioner-info-consumer";
import { DB_OPERATION } from "@/constant/db-operation";
import { logger } from "@/utils/logger";

const consumer = kafkaConsumerClient.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID!,
});

// Single database topic from environment variable
const DATABASE_TOPIC = process.env.KAFKA_DB_CHANGES_TOPIC || "database.changes";

/**
 * Helper function to log consumer operations in a more structured way
 */
const logConsumerOperation = (
  operation: string,
  collection: string,
  data: any,
  status: "success" | "error" | "warning" = "success"
) => {
  const meta = {
    operation,
    collection,
    timestamp: new Date().toISOString(),
  };

  switch (status) {
    case "success":
      logger.success(`Consumer operation: ${operation} on ${collection}`, {
        ...meta,
        data,
      });
      break;
    case "error":
      logger.error(`Failed consumer operation: ${operation} on ${collection}`, {
        ...meta,
        data,
      });
      break;
    case "warning":
      logger.warn(
        `Warning in consumer operation: ${operation} on ${collection}`,
        {
          ...meta,
          data,
        }
      );
      break;
  }
};

// Collection to consumer mapping
const COLLECTION_CONSUMER_MAP = {
  branches: branchConsumer,
  users: userConsumer,
  organizations: orgConsumer,
  practitioners: pracConsumer,
  practitioner_infos: pracInfoConsumer,
  // Add more collection mappings as needed
};
type TCollectionName = keyof typeof COLLECTION_CONSUMER_MAP;
// Main consumer function to connect and listen for database change messages
export const mainConsumer = async () => {
  logger.banner("Starting Kafka Consumer Service");
  await consumer.connect();
  logger.success("Main consumer connected ✅");

  // Subscribe to database change topic
  await consumer.subscribe({ topic: DATABASE_TOPIC, fromBeginning: true });
  logger.info("Subscribed to database topic:", DATABASE_TOPIC);

  consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        logger.warn("Received message without value, skipping.");
        return;
      }

      try {
        const changeEvent = JSON.parse(message.value.toString());
        const { operationType, collection, fullDocument, documentKey } =
          changeEvent;

        logger.info(
          `Database change detected: ${operationType} on ${collection}`,
          { collection, operationType }
        );

        // Get the appropriate consumer for this collection
        const consumerFn =
          COLLECTION_CONSUMER_MAP[collection as TCollectionName];

        if (!consumerFn) {
          logger.warn(`No consumer found for collection: ${collection}`, {
            collection,
          });
          return;
        }

        // Prepare data for the consumer
        let dataForConsumer;

        if (operationType === DB_OPERATION.INSERT && fullDocument) {
          dataForConsumer = fullDocument;
        } else if (operationType === DB_OPERATION.UPDATE && fullDocument) {
          dataForConsumer = fullDocument;
        } else if (operationType === DB_OPERATION.DELETE && documentKey) {
          dataForConsumer = documentKey;
        } else {
          logger.warn(`Insufficient data for operation: ${operationType}`, {
            operationType,
            collection,
          });
          return;
        }

        // Call the appropriate consumer function with explicit type assertion
        await (consumerFn as any)(operationType, dataForConsumer);

        // Log the consumer operation
        logConsumerOperation(
          operationType,
          collection,
          dataForConsumer,
          "success"
        );
      } catch (error) {
        logger.error("Error processing database change event:", error);
      }
    },
  });
};
