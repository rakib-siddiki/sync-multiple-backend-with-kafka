export const DB_OPERATION = {
  INSERT: "insert",
  UPDATE: "update",
  DELETE: "delete",
  REPLACE: "replace",
  DROP: "drop",
  RENAME: "rename",
  DROP_DATABASE: "dropDatabase",
  INVALIDATE: "invalidate",
} as const
export type TDbOperation = (typeof DB_OPERATION)[keyof typeof DB_OPERATION];
