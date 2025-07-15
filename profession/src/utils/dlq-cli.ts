#!/usr/bin/env node

/**
 * CLI tool for managing DLQ messages
 *
 * Run with: npx ts-node src/utils/dlq-cli.ts [command] [options]
 *
 * Commands:
 * - monitor: Monitor all DLQ topics
 * - list: List all DLQ topics
 * - view <topic>: View messages in a specific DLQ topic
 */

import { Kafka, logLevel } from "kafkajs";
import readline from "readline";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Default DLQ suffix
const DLQ_SUFFIX = ".dlq";

// Create Kafka client
const kafka = new Kafka({
  clientId: "dlq-cli-tool",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: logLevel.ERROR,
});

// Create CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function listDLQTopics() {
  const admin = kafka.admin();
  await admin.connect();

  try {
    console.log("Fetching Kafka topics...");
    const topics = await admin.listTopics();
    const dlqTopics = topics.filter((topic) => topic.endsWith(DLQ_SUFFIX));

    if (dlqTopics.length === 0) {
      console.log("\nNo DLQ topics found.");
    } else {
      console.log(`\nFound ${dlqTopics.length} DLQ topics:`);
      dlqTopics.forEach((topic) => {
        console.log(` - ${topic} (original: ${topic.replace(DLQ_SUFFIX, "")})`);
      });
    }
  } finally {
    await admin.disconnect();
  }
}

async function viewDLQMessages(topic: string, limit: number = 10) {
  if (!topic.endsWith(DLQ_SUFFIX)) {
    topic = `${topic}${DLQ_SUFFIX}`;
  }

  const admin = kafka.admin();
  await admin.connect();

  try {
    const topics = await admin.listTopics();
    if (!topics.includes(topic)) {
      console.error(`Topic "${topic}" does not exist.`);
      return;
    }
  } finally {
    await admin.disconnect();
  }

  console.log(`Fetching messages from ${topic}...`);

  const consumer = kafka.consumer({
    groupId: `dlq-cli-viewer-${Date.now()}`,
  });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  let count = 0;
  const messages: any[] = [];

  await new Promise<void>((resolve) => {
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = JSON.parse(message.value?.toString() || "{}");
          const headers = Object.fromEntries(
            Object.entries(message.headers || {}).map(([key, val]) => [
              key,
              (val as Buffer)?.toString(),
            ])
          );

          messages.push({
            offset: message.offset,
            partition,
            timestamp: message.timestamp,
            headers,
            value,
          });

          count++;
          if (count >= limit) {
            resolve();
          }
        } catch (error) {
          console.error(`Error processing message: ${error}`);
        }
      },
    });

    // Auto-resolve after 5 seconds if we don't get enough messages
    setTimeout(resolve, 5000);
  });

  await consumer.disconnect();

  if (messages.length === 0) {
    console.log(`No messages found in topic ${topic}.`);
    return;
  }

  console.log(`\nFound ${messages.length} message(s) in ${topic}:`);

  messages.forEach((msg, i) => {
    console.log(`\n--- Message ${i + 1} ---`);
    console.log(`Partition: ${msg.partition}, Offset: ${msg.offset}`);
    console.log(`Timestamp: ${new Date(Number(msg.timestamp)).toISOString()}`);

    if (msg.headers) {
      console.log("\nHeaders:");
      Object.entries(msg.headers).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }

    console.log("\nValue:");
    try {
      console.log(JSON.stringify(msg.value, null, 2));
    } catch (e: any) {
      console.log(`Failed to stringify value: ${e.message}`);
      console.log(msg.value);
    }
  });
}

async function monitorDLQs() {
  const admin = kafka.admin();
  await admin.connect();

  try {
    const topics = await admin.listTopics();
    const dlqTopics = topics.filter((topic) => topic.endsWith(DLQ_SUFFIX));

    if (dlqTopics.length === 0) {
      console.log("No DLQ topics found to monitor.");
      return;
    }

    console.log(`Monitoring ${dlqTopics.length} DLQ topics:`);
    dlqTopics.forEach((topic) => console.log(` - ${topic}`));

    const consumer = kafka.consumer({
      groupId: `dlq-cli-monitor-${Date.now()}`,
    });

    await consumer.connect();

    for (const topic of dlqTopics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    console.log("\nWaiting for new DLQ messages... (Press Ctrl+C to exit)");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const timestamp = new Date().toISOString();
        console.log(
          `\n[${timestamp}] New message in ${topic} (partition ${partition}, offset ${message.offset})`
        );

        try {
          const value = JSON.parse(message.value?.toString() || "{}");
          console.log(JSON.stringify(value, null, 2));
        } catch (e: any) {
          console.log(`Failed to parse message value: ${e.message}`);
          console.log(message.value?.toString());
        }
      },
    });
  } finally {
    // This will only run if the function is properly terminated, not on SIGINT
    await admin.disconnect();
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  try {
    switch (command) {
      case "list":
        await listDLQTopics();
        break;

      case "view": {
        const topic = args[1];
        const limit = parseInt(args[2] || "10");

        if (!topic) {
          console.error("Error: Please provide a topic name.");
          console.log("Usage: dlq-cli.ts view <topic> [limit]");
          process.exit(1);
        }

        await viewDLQMessages(topic, limit);
        break;
      }

      case "monitor":
        await monitorDLQs();
        break;

      default:
        console.log("DLQ CLI - Manage Kafka Dead Letter Queues");
        console.log("\nUsage:");
        console.log("  dlq-cli.ts list                  List all DLQ topics");
        console.log(
          "  dlq-cli.ts view <topic> [limit]  View messages in a DLQ topic"
        );
        console.log(
          "  dlq-cli.ts monitor               Monitor all DLQ topics for new messages"
        );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    if (command !== "monitor") {
      rl.close();
    }
  }
}

// Run the CLI
main().catch(console.error);
