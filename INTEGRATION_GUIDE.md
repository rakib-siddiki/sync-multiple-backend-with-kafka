# Integration Guide: Generic Database Watcher

This guide shows you how to integrate your new generic database watcher system with your existing project.

## Overview

Your new system replaces schema-specific change stream watchers with a single, generic database watcher that:

1. Watches all collections in your MongoDB database
2. Produces generic messages to Kafka topics
3. Routes changes to your existing consumers

## Setup Steps

### 1. Configure the Database Watcher

1. **Update the `.env` file** in `database-watcher/.env`:

   ```env
   # Point to your dashboard database
   MONGODB_URI=mongodb://localhost:27017/dashboard

   # Use your existing Kafka brokers
   KAFKA_BROKERS=localhost:9092
   KAFKA_CLIENT_ID=database-watcher

   # Configure topics
   KAFKA_TOPIC_INSERT=database.insert
   KAFKA_TOPIC_UPDATE=database.update
   KAFKA_TOPIC_DELETE=database.delete

   # Watch only the collections you need
   WATCH_COLLECTIONS=users,organizations,practitioners,schedules,notifications,branches

   # Exclude system collections
   EXCLUDE_COLLECTIONS=sessions,migrations

   LOG_LEVEL=info
   BATCH_SIZE=50
   ```

### 2. Start the Database Watcher

```bash
cd database-watcher
npm install
npm run build
npm start
```

### 3. Remove Schema-Specific Watchers

✅ **Already Done**: Removed change stream watcher from `user.model.ts`

**Next Steps**: Remove similar watchers from other models:

- `organization.model.ts`
- `practitioner.model.ts`
- `schedule.model.ts`
- `notification.model.ts`
- `branch.model.ts`

### 4. Consumer Integration

✅ **Already Done**:

- Added database change consumer
- Updated topics configuration
- Updated main consumer

### 5. Testing

1. **Start your services**:

   ```bash
   # Terminal 1: Start Kafka & MongoDB
   docker-compose up kafka mongodb

   # Terminal 2: Start Database Watcher
   cd database-watcher && npm start

   # Terminal 3: Start Dashboard (producer)
   cd dashboard && npm run dev

   # Terminal 4: Start Profession service (consumer)
   cd profession && npm run dev
   ```

2. **Test the flow**:
   - Create/update/delete a user in your dashboard
   - Check database watcher logs for change detection
   - Check profession service logs for message consumption
   - Verify data synchronization

## Message Flow

### Before (Schema-Specific)

```
User Model → setupChangeStreamWatcher → sendUserCreated → Kafka → userConsumer
```

### After (Generic)

```
User Model → Database Watcher → Kafka → DatabaseChangeConsumer → userConsumer
```

## Benefits

1. **Unified Watching**: One service watches all collections
2. **Decoupled**: Database watcher is independent of your main applications
3. **Configurable**: Easily include/exclude collections via environment variables
4. **Scalable**: Can handle high-throughput scenarios with batching
5. **Maintainable**: No need to add watchers to individual models

## Message Format

The database watcher sends messages in this format:

```json
{
  "operationType": "insert|update|delete|replace",
  "database": "dashboard",
  "collection": "users",
  "documentKey": {
    "_id": "user_id_here"
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "fullDocument": {
    "// complete document for insert/update"
  },
  "updateDescription": {
    "// update details for update operations"
  }
}
```

## Advanced Configuration

### Watch Specific Collections

```env
WATCH_COLLECTIONS=users,organizations,practitioners
```

### Use Single Topic for All Operations

```env
KAFKA_DB_CHANGES_TOPIC=database.changes
# Comment out individual topics
# KAFKA_TOPIC_INSERT=
# KAFKA_TOPIC_UPDATE=
# KAFKA_TOPIC_DELETE=
```

### Multiple Databases

You can run multiple database watchers for different databases:

```bash
# Watcher 1: Dashboard database
MONGODB_URI=mongodb://localhost:27017/dashboard
KAFKA_CLIENT_ID=dashboard-watcher

# Watcher 2: Analytics database
MONGODB_URI=mongodb://localhost:27017/analytics
KAFKA_CLIENT_ID=analytics-watcher
```

## Troubleshooting

### Common Issues

1. **MongoDB Replica Set Required**: Change streams require a replica set
2. **Topic Auto-creation**: Ensure Kafka auto-creates topics or create them manually
3. **Connection Issues**: Check MongoDB and Kafka connectivity
4. **Permission Issues**: Ensure database user has read permissions

### Debug Mode

```env
LOG_LEVEL=debug
```

### Health Checks

The database watcher logs status every 30 seconds:

```
📊 Status: {
  isRunning: true,
  mongoConnected: true,
  kafkaConnected: true,
  bufferSize: 0,
  database: "dashboard"
}
```

## Migration Strategy

### Phase 1: Parallel Running (Recommended)

1. Keep existing schema-specific watchers
2. Start database watcher
3. Compare outputs to ensure consistency
4. Monitor for any issues

### Phase 2: Switch Over

1. Remove schema-specific watchers
2. Rely solely on database watcher
3. Monitor closely

### Phase 3: Cleanup

1. Remove unused watcher utilities
2. Remove unused imports
3. Update documentation

## Next Steps

1. **Test thoroughly** with your specific data
2. **Monitor performance** under load
3. **Add alerting** for database watcher health
4. **Consider clustering** for high availability
5. **Implement metrics** for monitoring

## Support

If you encounter issues:

1. Check logs in both services
2. Verify environment configuration
3. Test connectivity manually
4. Check Kafka topic creation/consumption
