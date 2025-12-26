import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { GAMIFICATION_REWARDS_CONFIG } from '../utilities/rewards-pricing';
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
    | 'excuse_logged_daily_checkin'
    | 'custom_ai_task';

  durationMinutes?: number;
  excuseReason?: string;
  overcome: boolean;
  xpReward: number;
  gemsReward: number;
  activityName?: string; // For custom activities or AI tasks
  description?: string;
  status?: 'active' | 'completed' | 'attended' | 'skipped'; // For AI tasks, to indicate if it was completed or not
  // ... any other details from the client
  askCoach?: string;
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
  status: 'attended' | 'skipped' | 'active' | 'completed';
  xpEarned: number; // Replaces stakesEarned
  gemsEarned: number; // New currency
  overcome: boolean;
  durationMinutes: number;
  activityName: string;
  description: string;
  excuseReason: string;
  notes: string;
  askCoach: string;
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
    throwHttpsError('unauthenticated', t.common.noUserFound);
  }
  const userId = context.auth.uid;
  functions.logger.info(`Creating log for user: ${userId}`, { data });

  if (!data.type || !data.timezone || !data.date) {
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

  // 2. --- CORE TIMEZONE & REWARD LOGIC ---
  let xpAwarded = 0;
  let gemsAwarded = 0;
  let status: 'attended' | 'skipped' | 'active' | 'completed';

  // Define rewards based on activity type
  switch (data.type) {
    case 'custom_activity':
      xpAwarded = GAMIFICATION_REWARDS_CONFIG.eventRewards.custom_activity.xp;
      gemsAwarded =
        GAMIFICATION_REWARDS_CONFIG.eventRewards.custom_activity.gems;
      status = 'attended';
      break;
    case 'daily_checkin':
      xpAwarded = GAMIFICATION_REWARDS_CONFIG.eventRewards.daily_checkin.xp;
      gemsAwarded = GAMIFICATION_REWARDS_CONFIG.eventRewards.daily_checkin.gems;
      status = 'attended';
      break;

    case 'excuse_logged_daily_checkin':
      xpAwarded =
        GAMIFICATION_REWARDS_CONFIG.eventRewards.excuse_logged_daily_checkin.xp;
      gemsAwarded =
        GAMIFICATION_REWARDS_CONFIG.eventRewards.excuse_logged_daily_checkin
          .gems;
      status = 'skipped';
      break;
    case 'custom_ai_task':
      xpAwarded = 0; // update the xp award only when the task is completed
      gemsAwarded = 0; // update the gems award only when the task is completed
      status = data.status as any;
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
        overcome: data.type === 'excuse_logged_daily_checkin' ? false : true,
        status,
        durationMinutes: data.durationMinutes || 0,
        activityName: data.activityName || '',
        description: data.description || '',
        excuseReason: data.excuseReason || '',
        askCoach: data.askCoach || '',
        notes: '',
        xpEarned: data.type === 'custom_ai_task' ? data.xpReward : xpAwarded,
        gemsEarned:
          data.type === 'custom_ai_task' ? data.gemsReward : gemsAwarded,
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
  createdAt: Date;
  id: string;
  date: admin.firestore.Timestamp;
  type:
    | 'gym_workout'
    | 'run'
    | 'yoga'
    | 'daily_checkin'
    | 'excuse_logged_daily_checkin';
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
    throwHttpsError('unauthenticated', t.common.noUserFound);
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
      const data = doc.data();
      // Cast the Firestore document data to our ActivityLog interface
      const log: ActivityLog = {
        ...data,
        id: doc.id,
        createdAt: data?.createdAt ? data.createdAt.toDate().toISOString() : '',
      } as ActivityLog;

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

// --- Type Definitions ---

// This now reflects the flattened structure of the update payload.
interface UpdateLogRequestData {
  logId: string; // The ID of the document to update
  fieldsToUpdate: {
    status?: 'completed' | 'skipped' | 'active' | 'attended';
    activityName?: string;
    durationMinutes?: number;
  };
  language: string;
}

/**
 * A Callable Cloud Function to update an existing activity log with a flattened data structure.
 * It uses a whitelist to ensure only safe fields can be modified.
 *
 * @param {UpdateLogRequestData} data - The client-sent data, including logId and the update payload.
 * @param {functions.https.CallableContext} context - The call's context, including authentication.
 */
const updateActivityLogHandler = async (
  data: UpdateLogRequestData,
  context: functions.https.CallableContext,
) => {
  const t = getTranslation(data.language);

  // 1. --- AUTHENTICATION & VALIDATION ---
  if (!context.auth) {
    throwHttpsError('unauthenticated', t.common.noUserFound);
  }
  const userId = context.auth.uid;

  if (!data.logId || !data.fieldsToUpdate) {
    throwHttpsError(
      'invalid-argument',
      "A 'logId' and 'fieldsToUpdate' object are required.",
    );
  }

  // 2. --- PREPARE REFERENCES ---
  const userDocRef = db.collection('users').doc(userId);
  const logDocRef = userDocRef.collection('activityLogs').doc(data.logId);

  // 3. --- ATOMIC TRANSACTION ---
  try {
    await db.runTransaction(async (transaction) => {
      // --- a. Read the activity log document ---
      const logDoc = await transaction.get(logDocRef);
      if (!logDoc.exists) {
        throwHttpsError(
          'not-found',
          'The specified activity log was not found.',
        );
      }
      const logData = logDoc.data();

      // --- b. Sanitize the update payload (as before) ---
      const allowedFields = new Set([
        'status',
        'activityName',
        'durationMinutes',
        'notes',
      ]);
      const sanitizedUpdatePayload: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(data.fieldsToUpdate)) {
        if (allowedFields.has(key)) {
          sanitizedUpdatePayload[key] = value;
        }
      }
      if (Object.keys(sanitizedUpdatePayload).length === 0) {
        throwHttpsError(
          'invalid-argument',
          'No valid fields were provided for update.',
        );
      }

      // --- c. CORE LOGIC: Grant pre-defined rewards on completion ---

      // Check ALL conditions:
      // 1. Is the status being updated to 'completed'?
      // 2. Was the log's *previous* status NOT 'completed'? (Prevents re-awarding)
      // 3. Is the log's type 'custom_ai_task'?
      if (
        sanitizedUpdatePayload.status === 'completed' &&
        logData?.status !== 'completed' &&
        logData?.type === 'custom_ai_task'
      ) {
        // Get the reward values that are already on the document.
        const xpToAward = logData.xpEarned || 0;
        const gemsToAward = logData.gemsEarned || 0;

        functions.logger.info(
          `User ${userId} completed AI task ${data.logId}. Awarding ${xpToAward} XP and ${gemsToAward} Gems.`,
        );

        // If there are rewards to grant, update the user's main gamification stats.
        if (xpToAward > 0 || gemsToAward > 0) {
          const userGamificationUpdates = {
            'gamification.xpTotal':
              admin.firestore.FieldValue.increment(xpToAward),
            'gamification.gemsBalance':
              admin.firestore.FieldValue.increment(gemsToAward),
          };
          transaction.update(userDocRef, userGamificationUpdates);
        }
      }

      // --- d. Write the update to the activity log ---
      // This happens regardless of whether rewards were granted.
      transaction.update(logDocRef, sanitizedUpdatePayload);
    });

    // 4. --- RETURN SUCCESS ---
    functions.logger.info(
      `Successfully updated log ${data.logId} for user ${userId}.`,
    );
    return {
      success: true,
      message: 'Your activity has been successfully updated!',
    };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    functions.logger.error(
      `Error in updateActivityLog transaction for user ${userId}:`,
      error,
    );
    throwHttpsError(
      'internal',
      'Failed to update your activity. Please try again.',
    );
  }
};

export {
  createActivityLogHandler,
  getCalendarActivityLogHandler,
  updateActivityLogHandler,
};
