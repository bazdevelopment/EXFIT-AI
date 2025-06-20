export interface ICreateLogRequestData {
  language: string;
  type: 'daily_checkin' | 'excuse_logged';
  details: {
    durationMinutes?: number;
    excuseReason?: string;
    activityName?: string;
  };
  linkedAiTaskId?: string | null;
}

export interface ICreateLogResponseData {
  logId: string;
  message: string;
}

enum CalendarDayStatus {
  ATTENDED = 'attended', // Green Day
  SKIPPED = 'skipped', // Red Day
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
 * The structure of the 'details' map inside an ActivityLog document.
 */
interface ActivityLogDetails {
  durationMinutes?: number;
  excuseReason?: string;
  overcome?: boolean;
}

/**
 * The structure of a document in the 'activityLogs' subcollection.
 */
interface ActivityLog {
  date: admin.firestore.Timestamp;
  type: 'gym_workout' | 'run' | 'yoga' | 'daily_checkin' | 'excuse_logged';
  status: 'attended' | 'skipped';
  details: ActivityLogDetails;
}

/**
 * The structure of the JSON object that will be returned to the client.
 * e.g., { "2025-06-01": "attended", "2025-06-02": "skipped" }
 */
export type CalendarStatusMap = {
  [dateString: string]: CalendarDayStatus;
};
