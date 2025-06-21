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
  type: 'daily_checkin' | 'excuse_logged' | 'custom_activity';
  details: {
    durationMinutes?: number;
    activityName?: string;
    excuseReason?: string;
    overcome?: boolean;
    // ... add any other client-provided details
  };
  linkedAiTaskId?: string;
  date?: string; // Optional: Date in "YYYY-MM-DD" format
}

/**
 * The full, final structure of the document to be written to Firestore.
 * This is constructed on the server.
 */
interface ActivityLogDocument {
  date: admin.firestore.Timestamp;
  createdAt: admin.firestore.FieldValue;
  type: 'daily_checkin' | 'excuse_logged' | 'custom_activity';
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

// eslint-disable-next-line valid-jsdoc
/**
 * Callable Cloud Function to create a new activity log for the authenticated user.
 * Validates input, determines server-side values, and writes to Firestore.
 *
 * @param {CreateLogRequestData} data - The client-sent data, conforming to CreateLogRequestData.
 * @param {functions.https.CallableContext} context - The call's context, including authentication information.
 * @returns {{ logId: string; message: string }} An object containing the ID of the new document and a confirmation message.
 */
const createActivityLogHandler = async (
  data: CreateLogRequestData,
  context: functions.https.CallableContext, // Use CallableContext for better type inference
): Promise<{ logId: string; message: string }> => {
  const t = getTranslation(data.language);

  // 1. --- AUTHENTICATION ---
  if (!context.auth) {
    throwHttpsError('unauthenticated', t.common.notAuthorized);
  }
  const userId = context.auth.uid;
  functions.logger.info(`Attempting to create log for user: ${userId}`, {
    data,
  });

  // 2. --- INPUT VALIDATION ---
  if (!data.type || !data.details) {
    throwHttpsError(
      'invalid-argument',
      "The 'type' and 'details' fields are required.",
    );
  }

  // Determine the activity date, prioritizing the provided date or defaulting to today.
  let activityDate: Date;
  if (data.date) {
    // Parse provided date string. Append 'T00:00:00' to ensure UTC interpretation for consistency.
    const parsedDate = new Date(`${data.date}T00:00:00Z`); // Added 'Z' for explicit UTC
    if (isNaN(parsedDate.getTime())) {
      throwHttpsError(
        'invalid-argument',
        'Invalid date format. Expected YYYY-MM-DD.',
      );
    }
    activityDate = parsedDate;
  } else {
    // Use today's date, normalized to midnight UTC.
    activityDate = new Date();
    activityDate.setUTCHours(0, 0, 0, 0); // Use setUTCHours for timezone independence
  }

  // Prepare the activity log document with initial values.
  const finalLog: ActivityLogDocument = {
    date: admin.firestore.Timestamp.fromDate(activityDate),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: data.type,
    details: data.details,
    status: 'attended', // Default status
    stakesEarned: 0, // Default stakes
    linkedAiTaskId: data?.linkedAiTaskId || '',
  };

  // 3. --- SERVER-SIDE BUSINESS LOGIC ---
  switch (data.type) {
    case 'daily_checkin':
      finalLog.stakesEarned = 50; // Award for daily check-in
      break;
    case 'custom_activity':
      finalLog.stakesEarned = 50; // Award for daily check-in
      break;
    case 'excuse_logged':
      finalLog.status = 'skipped'; // Excuse means activity was skipped
      finalLog.details.overcome = false; // By default, an excuse means it wasn't overcome
      break;
    default:
      throwHttpsError('invalid-argument', `Unsupported log type: ${data.type}`);
  }

  // 4. --- WRITE TO FIRESTORE ---
  try {
    const userActivityLogsRef = db
      .collection('users')
      .doc(userId)
      .collection('activityLogs');

    const docRef = await userActivityLogsRef.add(finalLog);
    functions.logger.info(
      `Successfully created log ${docRef.id} for user ${userId}.`,
    );

    // 5. --- RETURN RESULT ---
    return {
      logId: docRef.id,
      message: 'Your activity has been successfully logged!',
    };
  } catch (error) {
    functions.logger.error(
      `Error writing activity log for user ${userId}:`,
      error,
    );
    throwHttpsError(
      'internal',
      'Failed to save your activity log. Please try again.',
    );
  }
};
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
  id: string;
  date: admin.firestore.Timestamp;
  type: 'gym_workout' | 'run' | 'yoga' | 'daily_checkin' | 'excuse_logged';
  status: 'attended' | 'skipped';
  details: ActivityLogDetails;
}

/**
 * The structure of the JSON object that will be returned to the client.
 * e.g., { "2025-06-01": "attended", "2025-06-02": "skipped" }
 */

interface CalendarActivityLogsMap {
  [date: string]: ActivityLog[] | null; // Key: "YYYY-MM-DD", Value: Array of all ActivityLog documents for that day, or null
}

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
  context: functions.https.CallableContext, // Use specific CallableContext type
): Promise<CalendarActivityLogsMap> => {
  const t = getTranslation(data.language);

  // 1. --- Authentication & Authorization Check ---
  if (!context.auth || !context.auth.uid) {
    throwHttpsError('unauthenticated', t.common.notAuthorized);
  }
  const userId = context.auth.uid;

  // 2. --- Input Validation and Date Parsing ---
  if (!data.startDate || !data.endDate) {
    throwHttpsError(
      'invalid-argument',
      "Function requires 'startDate' and 'endDate' arguments.",
    );
  }

  let queryStartDate: Date;
  let queryEndDate: Date;
  let clientStartDateForIteration: Date;
  let clientEndDateForIteration: Date;

  try {
    // Dates from dayjs are already YYYY-MM-DD, new Date() parses them as UTC midnight.
    // This is good for consistency if Firestore timestamps are also effectively UTC.
    clientStartDateForIteration = new Date(data.startDate);
    clientEndDateForIteration = new Date(data.endDate);

    // For the Firestore query, ensure timestamps cover the *entire* start and end days.
    queryStartDate = new Date(data.startDate);
    queryStartDate.setUTCHours(0, 0, 0, 0); // Start of the day in UTC

    queryEndDate = new Date(data.endDate);
    queryEndDate.setUTCHours(23, 59, 59, 999); // End of the day in UTC

    // Convert to Firestore Timestamps for the query
    const startTimestamp = admin.firestore.Timestamp.fromDate(queryStartDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(queryEndDate);

    functions.logger.info(
      `Fetching logs for user ${userId} from ${data.startDate} to ${data.endDate} (UTC query range: ${queryStartDate.toISOString()} to ${queryEndDate.toISOString()})`,
    );

    // 3. --- Initialize Calendar Map for the Full Interval ---
    const calendarActivityLogs: CalendarActivityLogsMap = {};
    const tempDate = new Date(clientStartDateForIteration); // Use a temporary mutable date for iteration

    while (tempDate <= clientEndDateForIteration) {
      const dayString = tempDate.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
      calendarActivityLogs[dayString] = null; // Initialize with null for all days in interval
      tempDate.setDate(tempDate.getDate() + 1); // Move to the next day
    }

    // 4. --- Fetch Activity Logs from Firestore ---
    const logsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('activityLogs')
      .where('date', '>=', startTimestamp)
      .where('date', '<=', endTimestamp)
      .orderBy('date', 'asc') // Order by date for consistent processing
      .get();

    // 5. --- Process Fetched Logs and Populate Map ---
    logsSnapshot.forEach((doc) => {
      // Cast the Firestore document data to our ActivityLog interface
      const log = { id: doc.id, ...doc.data() } as ActivityLog;

      // Extract the date string (YYYY-MM-DD) from the log's timestamp,
      // ensuring consistency with the key format used for initialization.
      const dayString = log.date.toDate().toISOString().split('T')[0];

      // If this is the first log encountered for this day, change null to an empty array.
      if (calendarActivityLogs[dayString] === null) {
        calendarActivityLogs[dayString] = [];
      }

      // Add the entire log data (including its ID) to the appropriate day's array.
      // TypeScript assertion to confirm it's an array for push.
      (calendarActivityLogs[dayString] as ActivityLog[]).push(log);
    });

    functions.logger.info(
      `Successfully processed ${logsSnapshot.size} activity logs for user ${userId}.`,
    );

    return calendarActivityLogs;
  } catch (error) {
    functions.logger.error('Error in getCalendarActivityLogHandler:', error);

    // Re-throw specific HttpsErrors if they originated from this function's explicit checks
    // Otherwise, throw a generic internal error
    if (error instanceof functions.https.HttpsError) {
      throw error;
    } else {
      throwHttpsError(
        'internal',
        'An unexpected error occurred while fetching your activity data.',
      );
    }
  }
};
export { createActivityLogHandler, getCalendarActivityLogHandler };
