export interface DatabaseChangeEvent {
  operationType:
    | "insert"
    | "update"
    | "delete"
    | "replace"
    | "drop"
    | "rename"
    | "dropDatabase"
    | "invalidate";
  fullDocument?: any;
  documentKey?: {
    _id: any;
  };
  updateDescription?: {
    updatedFields: any;
    removedFields: string[];
    truncatedArrays?: any[];
  };
  ns: {
    db: string;
    coll: string;
  };
  to?: {
    db: string;
    coll: string;
  };
  clusterTime: any;
  txnNumber?: number;
  lsid?: any;
  wallTime?: Date;
}

export interface KafkaMessage {
  topic: string;
  partition?: number;
  key?: string;
  value: string;
  timestamp?: string;
  headers?: Record<string, string>;
}

export interface WatcherConfig {
  mongoUri: string;
  kafkaBrokers: string[];
  kafkaClientId: string;
  topics: {
    insert?: string;
    update?: string;
    delete?: string;
    all?: string;
  };
  watchCollections?: string[];
  excludeCollections?: string[];
  logLevel: "error" | "warn" | "info" | "debug";
  batchSize: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
}
