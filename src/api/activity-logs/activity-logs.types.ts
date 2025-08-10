export interface ICreateLogRequestData {
  language: string;
  timezone: string;
  date: string; //YYYY-MM-DD
  type:
    | 'daily_checkin'
    | 'excuse_logged'
    | 'custom_activity'
    | 'excuse_logged_daily_checkin'
    | 'custom_ai_task';
  durationMinutes?: number;
  excuseReason?: string;
  activityName?: string;
  description?: string; // Optional description for custom activities or AI tasks
  overcome?: boolean;
  xpReward?: number; // Optional XP reward for the activity
  gemsReward?: number; // Optional Gems reward for the activity
  status?: 'active' | 'completed'; // For AI tasks, to indicate if it was completed or not
  askCoach?: string;
}

export interface IUpdateLogRequestData {
  language: string;
  logId: string;
  fieldsToUpdate: {
    status?: 'completed' | 'skipped' | 'active' | 'attended';
    activityName?: string;
    durationMinutes?: number;
    notes?: string;
  };
}

export interface IUpdateLogResponseData {
  success: boolean;
  message: string;
}

export interface ICreateLogResponseData {
  xpEarned: number;
  gemsEarned: number;
  newStreak: number;
}

/**
 * The structure of the data expected from the client-side call.
 */
export interface IRequestCalendarActivity {
  startDate: string; // Expected in ISO format, e.g., "2025-06-01T00:00:00.000Z"
  endDate: string; // Expected in ISO format, e.g., "2025-06-30T23:59:59.999Z"
  language: string;
}

/**
 * The structure of a document in the 'activityLogs' subcollection.
 */
export interface IActivityLog {
  activityName: string;
  createdAt: string;
  date: { _nanoseconds: number; _seconds: number };
  description: string;
  durationMinutes: number;
  excuseReason: string;
  gemsEarned: number;
  id: string;
  overcome: boolean;
  status: 'completed' | 'attended' | 'active' | 'skipped';
  type: string;
  xpEarned: number;
}

/**
 * The structure of the JSON object that will be returned to the client.
 * e.g., { "2025-06-01": "attended", "2025-06-02": "skipped" }
 */
export type CalendarStatusMap = {
  [dateString: string]: IActivityLog;
};
