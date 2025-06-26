import { TOPIC_LIST, TOPICS } from "@/constant/topics";
import { kafkaConsumerClient } from "./kafka-consumer";
import { branchConsumer } from "@/modules/branch/kafka/branch-consumer";
import { userConsumer } from "@/modules/user/kafka/user-consumer";

const consumer = kafkaConsumerClient.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID!,
});

// Helper to add topic handlers for a group, with correct type casting
function addTopicHandlers<T extends Record<string, string>, D>(
  map: Map<string, (data: D) => Promise<void>>,
  topics: T,
  handler: (topic: string, data: D) => Promise<void>
) {
  Object.values(topics).forEach((t) => {
    map.set(t, (data: D) => handler(t, data));
  });
}

// Handler function to build the topic handler map with minimal duplication
// This function creates a map of topic handlers for O(1) lookup
function buildTopicHandlerMap() {
  const map = new Map<string, (data: unknown) => Promise<void>>();
  addTopicHandlers(
    map,
    TOPICS.BRANCH,
    branchConsumer as (topic: string, data: unknown) => Promise<void>
  );
  addTopicHandlers(
    map,
    TOPICS.USER,
    userConsumer as (topic: string, data: unknown) => Promise<void>
  );
  return map;
}

// Main consumer function to connect and listen for messages
// This function will subscribe to all topics in TOPIC_LIST and handle messages accordingly
export const mainConsumer = async () => {
  await consumer.connect();
  console.log("Main consumer connected ✅");

  // Subscribe to all topics in TOPIC_LIST
  for (const topic of TOPIC_LIST) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }
  console.log("Subscribed to topics:", TOPIC_LIST.join(", "));

  consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        console.warn("Received message without value, skipping.");
        return;
      }

      const data = JSON.parse(message.value.toString());

      // Improved: use a handler map for O(1) dispatch and easier maintenance
      // Build the topic handler map using Map
      const topicHandlerMap = buildTopicHandlerMap();
      const handler = topicHandlerMap.get(topic);
      if (handler) {
        await handler(data);
      } else {
        console.warn(`Unhandled topic: ${topic}`);
      }
    },
  });
};
