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
} as const;

