import { branchConsumer } from "@/modules/branch/kafka/branch-consumer";
import { notificationConsumer } from "@/modules/notification/kafka/notification-consumer";
import { scheduleConsumer } from "@/modules/schedule/kafka/schedule-consumer";
import { userConsumer } from "@/modules/user/kafka/user-consumer";
import { kafkaConsumerClient } from "./kafka-consumer";
import { orgConsumer } from "@/modules/organization/kafka/organization-consumer";
import { pracConsumer } from "@/modules/practitioner/kafka/practitioner-consumer";
import { pracInfoConsumer } from "@/modules/practitioner/kafka/practitioner-info-consumer";

const consumer = kafkaConsumerClient.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID!,
});

// Single database topic from environment variable
const DATABASE_TOPIC = process.env.KAFKA_DB_CHANGES_TOPIC || "database.changes";

// Collection to consumer mapping
const COLLECTION_CONSUMER_MAP = {
  branches: branchConsumer,
  users: userConsumer,
  notifications: notificationConsumer,
  schedules: scheduleConsumer,
  organizations: orgConsumer,
  practitioners: pracConsumer,
  practitioner_infos: pracInfoConsumer,
  // Add more collection mappings as needed
};
type TCollectionName = keyof typeof COLLECTION_CONSUMER_MAP;
// Main consumer function to connect and listen for database change messages
export const mainConsumer = async () => {
  await consumer.connect();
  console.log("Main consumer connected ✅");

  // Subscribe to database change topic
  await consumer.subscribe({ topic: DATABASE_TOPIC, fromBeginning: true });
  console.log("Subscribed to database topic:", DATABASE_TOPIC);

  consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        console.warn("Received message without value, skipping.");
        return;
      }

      try {
        const changeEvent = JSON.parse(message.value.toString());
        const { operationType, collection, fullDocument, documentKey } =
          changeEvent;

        console.log(
          `Database change detected: ${operationType} on ${collection}`
        );

        // Get the appropriate consumer for this collection
        const consumerFn =
          COLLECTION_CONSUMER_MAP[collection as TCollectionName];

        if (!consumerFn) {
          console.warn(`No consumer found for collection: ${collection}`);
          return;
        }

        // Prepare data for the consumer
        let dataForConsumer;

        if (operationType === "insert" && fullDocument) {
          dataForConsumer = fullDocument;
        } else if (operationType === "update" && fullDocument) {
          dataForConsumer = fullDocument;
        } else if (operationType === "delete" && documentKey) {
          dataForConsumer = documentKey;
        } else {
          console.warn(`Insufficient data for operation: ${operationType}`);
          return;
        }

        // Call the appropriate consumer function with explicit type assertion
        await (consumerFn as any)(operationType, dataForConsumer);
      } catch (error) {
        console.error("Error processing database change event:", error);
      }
    },
  });
};
