import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { admin } from './common';
import { getTranslation } from './translations';

const db = admin.firestore();

// ===================================================================
// TYPE DEFINITIONS for clarity and type-safety
// ===================================================================

/**
 * The data payload that the CLIENT will send to the function.
 * Note the absence of server-controlled fields like `date`, `createdAt`, and `stakesEarned`.
 */
interface CreateLogRequestData {
  language: string;
  type: 'daily_checkin' | 'excuse_logged';
  details: {
    durationMinutes?: number;
    activityName?: string;
    excuseReason?: string;
    overcome?: boolean;
    // ... add any other client-provided details
  };
  linkedAiTaskId?: string;
}

/**
 * The full, final structure of the document to be written to Firestore.
 * This is constructed on the server.
 */
interface ActivityLogDocument {
  date: admin.firestore.Timestamp;
  createdAt: admin.firestore.FieldValue;
  type: 'daily_checkin' | 'excuse_logged';
  status: 'attended' | 'skipped';
  stakesEarned: number;
  details: {
    durationMinutes?: number;
    excuseReason?: string;
    overcome?: boolean;
    activityName?: string;
  };
  linkedAiTaskId?: string;
}

/**
 * A Callable Cloud Function to create a new activity log for the authenticated user.
 * It handles validation, determines server-side values, and writes to Firestore.
 *
 * @param {CreateLogRequestData} data - The data sent from the client, conforming to CreateLogRequestData.
 * @param {any} context - The context of the call, including authentication information.
 * @return {{ logId: string }} An object containing the ID of the newly created document.
 */
const createActivityLogHandler = async (
  data: CreateLogRequestData,
  context: any,
): Promise<{ logId: string; message: string }> => {
  // 1. --- AUTHENTICATION CHECK ---
  const t = getTranslation(data.language);

  if (!context.auth) {
    throwHttpsError('unauthenticated', t.common.notAuthorized);
  }
  const userId = context.auth.uid;
  functions.logger.info(`Log creation attempt by user ${userId}`, { data });

  // 2. --- INPUT VALIDATION ---
  if (!data.type || !data.details) {
    throwHttpsError(
      'invalid-argument',
      "The 'type' and 'details' fields are required.",
    );
  }

  // Prepare the final document with server-side logic
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize date to midnight

  const finalLog: ActivityLogDocument = {
    date: admin.firestore.Timestamp.fromDate(today),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: data.type,
    details: data.details,
    // Default values to be overridden by server logic
    status: 'attended',
    stakesEarned: 0,
    linkedAiTaskId: data?.linkedAiTaskId || '',
  };

  // 3. --- SERVER-SIDE BUSINESS LOGIC ---
  // This is the key benefit of using a Cloud Function.
  switch (data.type) {
    case 'daily_checkin':
      finalLog.status = 'attended';
      finalLog.stakesEarned = 50; // Standard reward for a attended activity
      break;

    case 'excuse_logged':
      finalLog.status = 'skipped'; // An excuse starts as 'skipped'
      finalLog.stakesEarned = 0; // No reward for just logging an excuse
      finalLog.details.overcome = false; // Explicitly set 'overcome' to false
      break;

    default:
      throwHttpsError('invalid-argument', `Invalid log type: ${data.type}`);
  }

  // 4. --- WRITE TO FIRESTORE ---
  try {
    const logCollectionRef = db
      .collection('users')
      .doc(userId)
      .collection('activityLogs');

    const docRef = await logCollectionRef.add(finalLog);
    functions.logger.info(
      `Successfully created log ${docRef.id} for user ${userId}.`,
    );

    // 5. --- RETURN RESULT ---
    return {
      logId: docRef.id,
      message: 'Thank you for logging your activity!',
    };
  } catch (error) {
    functions.logger.error(`Error writing log for user ${userId}:`, error);

    throwHttpsError(
      'internal',
      'Failed to save your activity log. Please try again.',
    );
  }
};

/**
 * Defines the possible states for a day on the calendar.
 * This enum makes the code more readable and less prone to typos.
 */
enum CalendarDayStatus {
  ATTENDED = 'attended', // Green Day
  SKIPPED = 'skipped', // Red Day
}

/**
 * The structure of the data expected from the client-side call.
 */
interface RequestData {
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
type CalendarStatusMap = {
  [dateString: string]: CalendarDayStatus;
};

// ===================================================================
// CLOUD FUNCTION
// ===================================================================

/**
 * A Callable Cloud Function to fetch and process activity logs for the calendar view.
 *
 * @param {RequestData} data - The data sent from the client, conforming to the RequestData interface.
 * @param {any} context - The context of the call, including authentication information.
 * @return {Promise<CalendarStatusMap>} A CalendarStatusMap object mapping date strings ("YYYY-MM-DD") to their status.
 */
const getCalendarActivityLogHandler = async (
  data: RequestData,
  context: any,
): Promise<CalendarStatusMap> => {
  // 1. --- AUTHENTICATION CHECK ---
  // Ensure the user is authenticated before proceeding.
  const t = getTranslation(data.language);

  if (!context.auth) {
    if (!context.auth) {
      throwHttpsError('unauthenticated', t.common.notAuthorized);
    }
  }
  const userId = context.auth.uid;

  // 2. --- INPUT VALIDATION ---
  // Validate that the required parameters are present.
  if (!data.startDate || !data.endDate) {
    throwHttpsError(
      'invalid-argument',
      "The function must be called with 'startDate' and 'endDate' arguments.",
    );
  }

  let startTimestamp: admin.firestore.Timestamp;

  let endTimestamp: admin.firestore.Timestamp;

  // Convert ISO date strings to Firestore Timestamps.
  try {
    startTimestamp = admin.firestore.Timestamp.fromDate(
      new Date(data.startDate),
    );
    endTimestamp = admin.firestore.Timestamp.fromDate(new Date(data.endDate));
  } catch (error) {
    throwHttpsError(
      'invalid-argument',
      'Invalid date format. Please provide dates in ISO string format..',
    );
  }

  functions.logger.info(
    `Fetching logs for user ${userId} from ${data.startDate} to ${data.endDate}`,
  );

  try {
    // 3. --- FIRESTORE QUERY ---
    // Fetch all activity logs for the user within the specified date range.
    const logsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('activityLogs')
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .get();

    const calendarStatus: CalendarStatusMap = {};

    // 4. --- DATA PROCESSING ---
    // Iterate over each log and determine the status for its day.
    logsSnapshot.forEach((doc) => {
      const log = doc.data() as ActivityLog;

      // Convert the Timestamp to a "YYYY-MM-DD" string to use as a key.
      const dayString = log.date.toDate().toISOString().split('T')[0];

      let currentDayStatus: CalendarDayStatus | null = null;

      // Determine the status based on the log's properties.
      if (log.status === 'attended') {
        currentDayStatus = CalendarDayStatus.ATTENDED;
      } else if (
        log.type === 'excuse_logged' &&
        log.details.overcome === true
      ) {
        currentDayStatus = CalendarDayStatus.ATTENDED;
      } else {
        // All other cases (skipped activities, unresolved excuses) are considered 'skipped'.
        currentDayStatus = CalendarDayStatus.SKIPPED;
      }

      // --- PRIORITY LOGIC ---
      // A 'attended' status for a day should always win.
      // If a day is already marked 'attended', don't downgrade it to 'skipped'
      // if another log for the same day was a skipped one.
      if (
        !calendarStatus[dayString] ||
        calendarStatus[dayString] !== CalendarDayStatus.ATTENDED
      ) {
        calendarStatus[dayString] = currentDayStatus;
      }
    });

    functions.logger.info(
      `Successfully processed ${logsSnapshot.size} logs for user ${userId}.`,
    );

    return calendarStatus;
  } catch (error) {
    functions.logger.error('Error fetching activity logs:', error);

    throwHttpsError(
      'internal',
      'An unexpected error occurred while fetching your activity data.',
    );
  }
};

export { createActivityLogHandler, getCalendarActivityLogHandler };
