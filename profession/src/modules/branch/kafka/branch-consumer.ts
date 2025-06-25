import { TOPICS } from "@/constant/topics";
import { BranchModel } from "../models/branch.model";
import { kafkaConsumerClient } from "@/config/kafka-consumer";

const branchConsumerClient = kafkaConsumerClient.consumer({
  groupId: process.env.KAFKA_CONSUMER_GROUP_ID! + "-branch",
});

const handleBranchCreate = async (branchData: any) => {
  try {
    const newBranch = new BranchModel(branchData);
    await newBranch.save();
    console.log(
      "%c[SUCCESS]%c Branch created successfully:",
      "color: green; font-weight: bold",
      "color: inherit",
      newBranch
    );
  } catch (err) {
    console.error("Error saving branch:", err);
  }
};

const handleBranchUpdate = async (branchData: any) => {
  try {
    const updated = await BranchModel.findOneAndUpdate(
      { _id: branchData._id },
      branchData,
      {
        new: true,
      }
    );
    if (updated) {
      console.log(
        "%c[SUCCESS]%c Branch updated successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        updated
      );
    } else {
      console.warn("Branch not found for update:", branchData._id);
    }
  } catch (err) {
    console.error("Error updating branch:", err);
  }
};

const handleBranchDelete = async (branchData: any) => {
  try {
    const deleted = await BranchModel.findOneAndDelete({ _id: branchData._id });
    if (deleted) {
      console.log(
        "%c[SUCCESS]%c Branch deleted successfully:",
        "color: green; font-weight: bold",
        "color: inherit",
        deleted
      );
    } else {
      console.warn("Branch not found for delete:", branchData._id);
    }
  } catch (err) {
    console.error("Error deleting branch:", err);
  }
};

export const branchConsumer = async () => {
  try {
    await branchConsumerClient.connect();
    // Subscribe to all topics in TOPICS
    for (const topic of Object.values(TOPICS.BRANCH)) {
      console.log("🚀 ~ topic:", topic);
      await branchConsumerClient.subscribe({ topic, fromBeginning: true });
    }

    await branchConsumerClient.run({
      eachMessage: async ({ topic, message }) => {
        console.log("🚀 ~ topic:", topic);
        if (!message.value) {
          return;
        }
        const branchData = JSON.parse(message.value?.toString());
        switch (topic) {
          case TOPICS.BRANCH.CREATE:
            await handleBranchCreate(branchData);
            break;
          case TOPICS.BRANCH.UPDATE:
            await handleBranchUpdate(branchData);
            break;
          case TOPICS.BRANCH.DELETE:
            await handleBranchDelete(branchData);
            break;
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
