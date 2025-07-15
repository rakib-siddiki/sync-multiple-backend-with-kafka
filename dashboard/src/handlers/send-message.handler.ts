import { producerClient } from "@/config/kafka-producer";

// Generic helper function to send a message to Kafka
export const sendKafkaMessage = async <T>(
    topic: string,
    message: T,
    key?: string
) => {
    try {
        await producerClient.connect();
        await producerClient.send({
            topic,
            messages: [
                {
                    key,
                    value: JSON.stringify(message),
                },
            ],
        });
        console.log(`Message sent to topic: ${topic}`);
    } catch (error) {
        console.error("Error sending Kafka message:", error);
    }
};
