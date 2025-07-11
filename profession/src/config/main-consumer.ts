import { TOPIC_LIST, TOPICS } from "@/constant/topics";
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

// Helper to add topic handlers for a group, with correct type inference
function addTopicHandlers<
  T extends Record<string, string>,
  TopicType extends T[keyof T],
  D
>(
  map: Map<TopicType, (data: D) => Promise<void>>,
  topics: T,
  handler: (topic: TopicType, data: D) => Promise<void>
) {
  (Object.values(topics) as TopicType[]).forEach((t) => {
    map.set(t, (data: D) => handler(t, data));
  });
}

// Handler function to build the topic handler map with minimal duplication
// This function creates a map of topic handlers for O(1) lookup
function buildTopicHandlerMap() {
  const map = new Map();
  addTopicHandlers(map, TOPICS.BRANCH, branchConsumer);
  addTopicHandlers(map, TOPICS.USER, userConsumer);
  addTopicHandlers(map, TOPICS.NOTIFICATION, notificationConsumer);
  addTopicHandlers(map, TOPICS.SCHEDULE, scheduleConsumer);
  addTopicHandlers(map, TOPICS.ORG, orgConsumer);
  addTopicHandlers(map, TOPICS.PRAC, pracConsumer);
  addTopicHandlers(map, TOPICS.PRAC_INFO, pracInfoConsumer);
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
