import { Kafka } from "kafkajs";
import { TOPICS } from "@/constant/topics";
import { UserModel } from "../models/user.model";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CONSUMER_CLIENT_ID!,
  brokers: [process.env.KAFKA_BROKER!],
});

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID! + "-user",
});

export const userConsumer = async () => {
  try {
    await consumer.connect();
    // Subscribe to all topics in TOPICS
    for (const topic of Object.values(TOPICS.USER)) {
      await consumer.subscribe({ topic, fromBeginning: true });
    }

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) {
          console.warn("Received message without value, skipping.");
          return;
        }
        const userData = JSON.parse(message.value?.toString());
        switch (topic) {
          case TOPICS.USER.CREATE:
            console.log("Received USER_CREATE:", userData);
            try {
              const newUser = new UserModel(userData);
              await newUser.save();
              console.log("User saved to database:", newUser);
            } catch (err) {
              console.error("Error saving user:", err);
            }
            break;
          case TOPICS.USER.UPDATE:
            console.log("Received USER_UPDATE:", userData);
            try {
              // Update user logic (replace with your update logic)
              await UserModel.findByIdAndUpdate(userData._id, userData, {
                new: true,
              });
              console.log("User updated in database:", userData._id);
            } catch (err) {
              console.error("Error updating user:", err);
            }
            break;
          case TOPICS.USER.DELETE:
            console.log("Received USER_DELETE:", userData);
            try {
              await UserModel.findByIdAndDelete(userData._id);
              console.log("User deleted from database:", userData._id);
            } catch (err) {
              console.error("Error deleting user:", err);
            }
          // Add more cases for other topics as needed
          default:
            console.warn(`Unhandled topic: ${topic}`);
        }
      },
    });
  } catch (error) {
    console.error("Error connecting to Kafka:", error);
  }
};
