# Database Watcher

A generic MongoDB database watcher that monitors all document changes and produces Kafka messages. This service is completely independent of any specific schema or project structure.

## Features

- 🔍 **Universal Monitoring**: Watches all collections in a MongoDB database
- 📨 **Kafka Integration**: Produces messages to configurable Kafka topics
- ⚙️ **Environment-Based Configuration**: All settings via environment variables
- 🎯 **Flexible Filtering**: Include/exclude specific collections
- 📦 **Batch Processing**: Efficient message batching for high throughput
- 🔄 **Auto-Reconnection**: Handles connection failures gracefully
- 📊 **Health Monitoring**: Built-in health checks and status reporting
- 🛡️ **Error Handling**: Comprehensive error handling and logging

## Supported MongoDB Operations

- `insert` - New document creation
- `update` - Document modifications
- `delete` - Document removal
- `replace` - Document replacement

## Installation

1. Clone or copy this directory to your project
2. Install dependencies:

```bash
cd database-watcher
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable        | Description                   | Example                          |
| --------------- | ----------------------------- | -------------------------------- |
| `MONGODB_URI`   | MongoDB connection string     | `mongodb://localhost:27017/mydb` |
| `KAFKA_BROKERS` | Comma-separated Kafka brokers | `localhost:9092`                 |

### Optional Environment Variables

| Variable                 | Description                              | Default            |
| ------------------------ | ---------------------------------------- | ------------------ |
| `KAFKA_CLIENT_ID`        | Kafka client identifier                  | `database-watcher` |
| `KAFKA_TOPIC_INSERT`     | Topic for insert operations              | -                  |
| `KAFKA_TOPIC_UPDATE`     | Topic for update operations              | -                  |
| `KAFKA_TOPIC_DELETE`     | Topic for delete operations              | -                  |
| `KAFKA_TOPIC_ALL`        | Single topic for all operations          | -                  |
| `WATCH_COLLECTIONS`      | Collections to watch (comma-separated)   | All collections    |
| `EXCLUDE_COLLECTIONS`    | Collections to exclude (comma-separated) | None               |
| `LOG_LEVEL`              | Logging level                            | `info`             |
| `BATCH_SIZE`             | Message batch size                       | `100`              |
| `RECONNECT_DELAY`        | Reconnection delay (ms)                  | `5000`             |
| `MAX_RECONNECT_ATTEMPTS` | Max reconnection attempts                | `10`               |

### Topic Configuration Options

You can configure topics in two ways:

**Option 1: Single topic for all operations**

```env
KAFKA_TOPIC_ALL=database.changes
```

**Option 2: Separate topics per operation**

```env
KAFKA_TOPIC_INSERT=database.insert
KAFKA_TOPIC_UPDATE=database.update
KAFKA_TOPIC_DELETE=database.delete
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker (Optional)

You can also create a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

CMD ["npm", "start"]
```

## Message Format

The service produces JSON messages with the following structure:

```json
{
  "operationType": "insert|update|delete|replace",
  "database": "database_name",
  "collection": "collection_name",
  "documentKey": {
    "_id": "document_id"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "fullDocument": {
    // Complete document (for insert/replace/update with lookup)
  },
  "updateDescription": {
    // Only for update operations
    "updatedFields": {},
    "removedFields": []
  }
}
```

### Message Headers

Each Kafka message includes headers:

- `content-type`: `application/json`
- `operation`: The operation type
- `database`: Database name
- `collection`: Collection name

### Message Key

Messages are keyed by: `{database}.{collection}.{documentId}`

## Examples

### Basic Setup

```env
MONGODB_URI=mongodb://localhost:27017/myapp
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ALL=database.changes
```

### Watch Specific Collections

```env
MONGODB_URI=mongodb://localhost:27017/myapp
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ALL=database.changes
WATCH_COLLECTIONS=users,orders,products
```

### Exclude System Collections

```env
MONGODB_URI=mongodb://localhost:27017/myapp
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ALL=database.changes
EXCLUDE_COLLECTIONS=sessions,migrations,__schema
```

### Separate Topics per Operation

```env
MONGODB_URI=mongodb://localhost:27017/myapp
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_INSERT=db.created
KAFKA_TOPIC_UPDATE=db.updated
KAFKA_TOPIC_DELETE=db.deleted
```

## Health Monitoring

The service logs its status every 30 seconds and provides health check methods:

```typescript
const watcher = new DatabaseWatcherService(config);
const status = watcher.getStatus();
console.log(status);
// Output:
// {
//   isRunning: true,
//   mongoConnected: true,
//   kafkaConnected: true,
//   bufferSize: 0,
//   reconnectAttempts: 0,
//   database: "myapp"
// }
```

## Integration with Your Existing Project

This database watcher is designed to run independently of your existing project. You can:

1. **Run as a separate service**: Deploy alongside your main application
2. **Use different database**: Point to the same MongoDB but different database
3. **Filter collections**: Watch only specific collections that matter
4. **Custom topics**: Use your existing Kafka topic naming convention

### Removing Schema-Specific Watchers

If you want to replace your existing schema-specific watchers (like in your `user.model.ts`), you can:

1. Remove the change stream setup from your models
2. Start this generic watcher
3. Configure it to watch the collections you need

For example, in your `user.model.ts`, you can remove:

```typescript
// Remove this block
setupChangeStreamWatcher(UserModel, {
  onInsert: async (document) => {
    await sendUserCreated(document);
  },
  onUpdate: async (document) => {
    await sendUserUpdated(document);
  },
  onDelete: async (documentKey) => {
    await sendUserDeleted({ _id: documentKey._id } as IUser);
  },
});
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Ensure MongoDB and Kafka are running and accessible
2. **Permission Errors**: Make sure the MongoDB user has read permissions
3. **Topic Errors**: Ensure Kafka topics exist or auto-creation is enabled
4. **Change Stream Errors**: MongoDB change streams require a replica set

### Debugging

Enable debug logging:

```env
LOG_LEVEL=debug
```

This will show detailed information about:

- Connection attempts
- Change events
- Message production
- Error details

## Production Considerations

1. **Replica Set**: MongoDB change streams require a replica set
2. **Resource Limits**: Monitor memory usage with large message batches
3. **Error Handling**: Implement alerting for connection failures
4. **Backpressure**: Consider Kafka producer configuration for high loads
5. **Security**: Use authentication for MongoDB and Kafka connections

## Contributing

Feel free to extend this service with additional features like:

- HTTP health check endpoint
- Prometheus metrics
- Custom message transformations
- Multiple database support
- Schema validation
