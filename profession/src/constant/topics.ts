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
