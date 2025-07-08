import { Model, Document } from "mongoose";
import type {
  ChangeStreamDocument,
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
  ChangeStreamDeleteDocument,
  ObjectId,
} from "mongodb";

export interface ChangeStreamHandlers<T extends Document> {
  onInsert?: (document: T) => Promise<void>;
  onUpdate?: (document: T) => Promise<void>;
  onDelete?: (documentKey: { _id: ObjectId }) => Promise<void>;
}

async function handleInsertOperation<T extends Document>(
  handlers: ChangeStreamHandlers<T>,
  change: ChangeStreamInsertDocument<T>
): Promise<void> {
  if (handlers.onInsert && change.fullDocument) {
    await handlers.onInsert(change.fullDocument);
  }
}

async function handleUpdateOperation<T extends Document>(
  handlers: ChangeStreamHandlers<T>,
  change: ChangeStreamUpdateDocument<T>,
  model: Model<T>,
  collectionName: string
): Promise<void> {
  if (!handlers.onUpdate) return;

  if (change.fullDocument) {
    await handlers.onUpdate(change.fullDocument);
  } else {
    // Fallback: fetch the document manually if fullDocument is not available
    const updatedDocument = await model.findOne({
      _id: change.documentKey._id,
    });
    if (updatedDocument) {
      await handlers.onUpdate(updatedDocument);
    } else {
      console.error(
        `Could not find updated ${collectionName} with ID:`,
        change.documentKey._id
      );
    }
  }
}

async function handleDeleteOperation<T extends Document>(
  handlers: ChangeStreamHandlers<T>,
  change: ChangeStreamDeleteDocument<T>
): Promise<void> {
  if (handlers.onDelete) {
    await handlers.onDelete(change.documentKey);
  }
}

/**
 * Sets up a change stream watcher for a MongoDB collection
 * @param model - The Mongoose model to watch
 * @param handlers - Object containing handler functions for different operation types
 * @param options - Optional change stream options
 */
export function setupChangeStreamWatcher<T extends Document>(
  model: Model<T>,
  handlers: ChangeStreamHandlers<T>,
  options: {
    fullDocument?: "default" | "updateLookup" | "whenAvailable" | "required";
  } = {
    fullDocument: "updateLookup",
  }
): void {
  const collectionName = model.collection.collectionName;

  model
    .watch([], options)
    .on("change", async (change: ChangeStreamDocument<T>) => {
      console.log(`${collectionName} collection change detected:`, change);

      try {
        switch (change.operationType) {
          case "insert":
            if (change.operationType === "insert") {
              await handleInsertOperation(handlers, change);
            }
            break;

          case "update":
            if (change.operationType === "update") {
              await handleUpdateOperation(
                handlers,
                change,
                model,
                collectionName
              );
            }
            break;

          case "delete":
            if (change.operationType === "delete") {
              await handleDeleteOperation(handlers, change);
            }
            break;

          default:
            console.log(`Unhandled operation type: ${change.operationType}`);
        }
      } catch (error) {
        console.error(`Error handling ${collectionName} change:`, error);
      }
    });

  console.log(`Change stream watcher set up for ${collectionName} collection`);
}
