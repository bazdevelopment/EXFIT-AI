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
  date: string;
  type:
    | 'gym_workout'
    | 'run'
    | 'yoga'
    | 'daily_checkin'
    | 'custom_activity'
    | 'excuse_logged';
  details: {
    durationMinutes?: number;
    excuseReason?: string;
    overcome?: boolean;
    // ... any other details from the client
  };
  timezone: string;
  language: string;
  linkedAiTaskId?: string;
}

/**
 * The full, final structure of the document to be written to Firestore.
 * This is constructed on the server.
 */
// The final structure of the document written to the 'activityLogs' collection
interface ActivityLogDocument {
  date: admin.firestore.Timestamp;
  createdAt: admin.firestore.FieldValue;
  type: CreateLogRequestData['type'];
  details: CreateLogRequestData['details'];
  status: 'attended' | 'skipped';
  xpEarned: number; // Replaces stakesEarned
  gemsEarned: number; // New currency
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
): Promise<{ xpEarned: number; gemsEarned: number; newStreak: number }> => {
  const t = getTranslation(data.language);

  // 1. --- AUTHENTICATION & VALIDATION ---
  if (!context.auth) {
    throwHttpsError('unauthenticated', t.common.notAuthorized);
  }
  const userId = context.auth.uid;
  functions.logger.info(`Creating log for user: ${userId}`, { data });

  if (!data.type || !data.details || !data.timezone || !data.date) {
    throwHttpsError(
      'invalid-argument',
      "The 'type', 'details', 'date' and 'timezone' fields are required.",
    );
  }

  let userLocalDayTimestamp: admin.firestore.Timestamp;

  try {
    // --- Timezone-Aware Date Calculation ---
    // This is the key to making streaks work globally.
    // Create a date object representing "now" in the user's local timezone
    const dateInUserTz = new Date(
      new Date(`${data.date}T00:00:00`).toLocaleString('en-US', {
        timeZone: data.timezone,
      }),
    );

    // Normalize this date to the beginning of the user's local day
    dateInUserTz.setHours(0, 0, 0, 0);
    userLocalDayTimestamp = admin.firestore.Timestamp.fromDate(dateInUserTz);
  } catch (error) {
    functions.logger.error('Invalid timezone provided:', data.timezone);
    throwHttpsError('invalid-argument', 'An invalid timezone was provided.');
  }

  // An excuse log is a special case and doesn't award points, so we handle it separately.
  if (data.type === 'excuse_logged') {
    return handleExcuseLog(userId, data, userLocalDayTimestamp);
  }

  // 2. --- CORE TIMEZONE & REWARD LOGIC ---
  let xpAwarded = 0;
  let gemsAwarded = 0;

  // Define rewards based on activity type
  switch (data.type) {
    case 'gym_workout':
    case 'custom_activity':
      xpAwarded = 30;
      gemsAwarded = 10;
      break;
    case 'daily_checkin':
      xpAwarded = 10;
      gemsAwarded = 2;
      break;
    default:
      throwHttpsError('invalid-argument', `Unsupported log type: ${data.type}`);
  }

  // 3. --- ATOMIC FIRESTORE TRANSACTION ---
  // Using a transaction is CRITICAL to prevent race conditions and ensure data consistency.
  const userDocRef = db.collection('users').doc(userId);
  try {
    const { newStreak } = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User data not found.',
        );
      }

      const gamification = userDoc.data()?.gamification || {};
      let currentStreak = gamification.currentStreak || 0;

      // --- Streak Increment Logic ---
      const lastActivityTs =
        gamification.lastActivityDate as admin.firestore.Timestamp;
      // Increment streak only if it's the first activity of this new local day.
      if (
        !lastActivityTs ||
        lastActivityTs.toMillis() < userLocalDayTimestamp.toMillis()
      ) {
        currentStreak++;
      }

      // --- Prepare Updates for User Document ---
      const userUpdates = {
        'gamification.lastActivityDate': userLocalDayTimestamp,
        'gamification.currentStreak': currentStreak,
        'gamification.xpTotal': admin.firestore.FieldValue.increment(xpAwarded),
        'gamification.xpWeekly':
          admin.firestore.FieldValue.increment(xpAwarded),
        'gamification.gemsBalance':
          admin.firestore.FieldValue.increment(gemsAwarded),
      };
      transaction.update(userDocRef, userUpdates);

      // --- Prepare the New Activity Log Document ---
      const finalLog: ActivityLogDocument = {
        date: userLocalDayTimestamp,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: data.type,
        details: data.details,
        status: 'attended',
        xpEarned: xpAwarded,
        gemsEarned: gemsAwarded,
      };
      const logDocRef = userDocRef.collection('activityLogs').doc();
      transaction.set(logDocRef, finalLog);

      return { newStreak: currentStreak }; // Return the new streak count
    });

    functions.logger.info(
      `Successfully logged activity for user ${userId}. Awarded ${xpAwarded} XP and ${gemsAwarded} Gems.`,
    );

    // 4. --- RETURN SUCCESS RESPONSE ---
    return { xpEarned: xpAwarded, gemsEarned: gemsAwarded, newStreak };
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
 * A helper function to handle the specific case of logging an excuse.
 * This does not award points and has a simpler logic.
 *
 * @param {string} userId - The ID of the user logging the excuse.
 * @param {CreateLogRequestData} data - The data payload for the excuse log.
 * @param {string} userLocalDate - The local date string representing the user's day.
 */
const handleExcuseLog = async (
  userId: string,
  data: CreateLogRequestData,
  userLocalDate: admin.firestore.Timestamp,
) => {
  // ... (This function would contain the logic for when data.type === 'excuse_logged')
  // For simplicity, we'll assume it just writes the log without a transaction.
  const excuseLog = {
    date: userLocalDate, // Excuses are logged instantly
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'excuse_logged',
    details: { ...data.details, overcome: false },
    status: 'skipped',
    xpEarned: 0,
    gemsEarned: 0,
  };
  const docRef = await db
    .collection('users')
    .doc(userId)
    .collection('activityLogs')
    .add(excuseLog);

  // Return a neutral response for an excuse
  return {
    xpEarned: 0,
    gemsEarned: 0,
    newStreak: 0,
    logId: docRef.id,
    message: '',
  };
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
