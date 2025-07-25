export const TOPICS = {
  USER: {
    CREATE: "user.create",
    UPDATE: "user.update",
    DELETE: "user.delete",
  },
  BRANCH: {
    CREATE: "branch.create",
    UPDATE: "branch.update",
    DELETE: "branch.delete",
  },
  SCHEDULE: {
    CREATE: "schedule.create",
    UPDATE: "schedule.update",
    DELETE: "schedule.delete",
  },
  NOTIFICATION: {
    CREATE: "notification.create",
    UPDATE: "notification.update",
    DELETE: "notification.delete",
  },
  ORG: {
    CREATE: "organization.create",
    UPDATE: "organization.update",
    DELETE: "organization.delete",
  },
  PRAC: {
    CREATE: "practitioner.create",
    UPDATE: "practitioner.update",
    DELETE: "practitioner.delete",
  },
  PRAC_INFO: {
    CREATE: "practitioner_info.create",
    UPDATE: "practitioner_info.update",
    DELETE: "practitioner_info.delete",
  },
  // Database change topics from the generic watcher
  DATABASE: {
    INSERT: "database.insert",
    UPDATE: "database.update",
    DELETE: "database.delete",
  },
} as const;

// Recursive type to extract all string values from a nested object
type ExtractStrings<T> = T extends string
  ? T
  : T extends Record<string, infer V>
  ? ExtractStrings<V>
  : never;

// Helper to flatten all topic values (runtime)
function flattenTopics<T extends object>(obj: T): ExtractStrings<T>[] {
  const result: string[] = [];
  for (const v of Object.values(obj)) {
    if (typeof v === "object" && v !== null) {
      result.push(...flattenTopics(v));
    } else if (typeof v === "string") {
      result.push(v);
    }
  }
  return result as ExtractStrings<T>[];
}

export const TOPIC_LIST = flattenTopics(TOPICS);

export type TAllTopic = ExtractStrings<typeof TOPICS>;
