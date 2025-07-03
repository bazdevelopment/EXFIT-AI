/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { toZonedTime } from 'date-fns-tz';
import * as logger from 'firebase-functions/logger';
import * as functions from 'firebase-functions/v1';
import moment from 'moment-timezone';

import * as activityLogsFunctions from './activity-logs';
import { admin } from './common';
import * as conversationFunctions from './conversation';
import * as excuseBusterFunctions from './excuse-buster';
import * as pushNotificationsFunctions from './push-notifications';
import * as scanImageFunctions from './scan';
import * as aiTasksFunctions from './tasks';
import * as userFunctions from './user';

const usCentralFunctions = functions.region('us-central1');
const db = admin.firestore();

export const getHelloWorld = usCentralFunctions.https.onCall(
  (data, context) => {
    logger.info('Hello logs!', { structuredData: true });
    const req = context.rawRequest;
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      );
    }
    return { message: data }; // Return a JSON response
  },
);

/** User collection cloud functions  */
export const loginUserAnonymously = usCentralFunctions.https.onCall(
  userFunctions.loginUserAnonymouslyHandler,
);

export const getUserInfo = usCentralFunctions.https.onCall(
  userFunctions.getUserInfo,
);

export const updateUser = usCentralFunctions.https.onCall(
  userFunctions.updateUserHandler,
);

export const checkEmailExist = usCentralFunctions.https.onCall(
  userFunctions.checkEmailExistsHandler,
);

/** ActivityLogs collection cloud functions  */

export const createActivityLog = usCentralFunctions.https.onCall(
  activityLogsFunctions.createActivityLogHandler,
);

export const getCalendarActivityLog = usCentralFunctions.https.onCall(
  activityLogsFunctions.getCalendarActivityLogHandler,
);

/** scan image collection cloud functions  */
export const analyzeScanImageConversation = usCentralFunctions.https.onRequest(
  scanImageFunctions.analyzeScanImageConversationHandler,
);
/** Make sure you use onRequest instead of onCall for analyzeImage function because onCall do not support FormData */

/** conversation collection cloud functions  */
export const continueConversation = usCentralFunctions.https.onRequest(
  conversationFunctions.continueConversationHandler,
);
export const continueConversationV2 = usCentralFunctions.https.onRequest(
  conversationFunctions.continueConversationV2,
);

export const getConversation = usCentralFunctions.https.onCall(
  conversationFunctions.getConversationHandler,
);
/** excuse buster conversation collection cloud functions  */
export const getExcuseBusterConversationMessages =
  usCentralFunctions.https.onCall(
    excuseBusterFunctions.getExcuseBusterConversationHandler,
  );
export const continueExcuseBusterConversation = usCentralFunctions.https.onCall(
  excuseBusterFunctions.continueExcuseBusterConversation,
);

/** ai tasks cloud functions  */
export const createAiTask = usCentralFunctions.https.onCall(
  aiTasksFunctions.createAiTasksHandler,
);
export const getAiTasks = usCentralFunctions.https.onCall(
  aiTasksFunctions.getAiTasksForDay,
);

export const updateAiTaskStatus = usCentralFunctions.https.onCall(
  aiTasksFunctions.updateAiTasksStatusHandler,
);

/** Push notifications  */

export const storeDeviceToken = usCentralFunctions.https.onCall(
  pushNotificationsFunctions.storeDeviceToken,
);
export const sendGlobalPushNotifications = usCentralFunctions.https.onCall(
  pushNotificationsFunctions.handleSendGlobalPushNotifications,
);
export const sendIndividualPushNotification = usCentralFunctions.https.onCall(
  pushNotificationsFunctions.sendUserPushNotification,
);
export const fetchUserNotifications = usCentralFunctions.https.onCall(
  pushNotificationsFunctions.handleGetUserNotification,
);
export const markNotificationAsRead = usCentralFunctions.https.onCall(
  pushNotificationsFunctions.handleMarkNotificationAsRead,
);

/**
 * A scheduled function that runs every day shortly after midnight (UTC).
 * It iterates through all users to:
 * 1. Check if a streak was broken.
 * 2. Use a Streak Freeze if available to save a broken streak.
 * 3. Reset weekly XP totals every Monday.
 * 4. Reset the 'isStreakProtected' flag.
 */
export const dailyGamificationUpdate = functions.pubsub
  .schedule('every day 00:10') // Run at a safe time after midnight
  .timeZone('UTC') // Use a consistent global timezone to avoid DST issues
  .onRun(async () => {
    functions.logger.info('Starting daily gamification update...');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to the beginning of the day in UTC
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Get the beginning of yesterday

    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      functions.logger.info('No users found. Exiting.');
      return null;
    }

    // Use a batched write for efficiency
    const batch = db.batch();
    let usersProcessed = 0;

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      const gamification = user.gamification || {};
      const lastActivityTs =
        gamification.lastActivityDate as admin.firestore.Timestamp;

      // Skip users with no gamification data or no activity yet
      if (!lastActivityTs) return;

      const lastActivityDate = lastActivityTs.toDate();
      lastActivityDate.setUTCHours(0, 0, 0, 0);

      const userRef = db.collection('users').doc(doc.id);
      const updates: { [key: string]: any } = {};

      // Always reset the protection flag from the previous day
      updates['gamification.isStreakProtected'] = false;

      // --- Core Streak Logic ---
      // Check if the last activity was before yesterday. If so, they missed a day.
      if (lastActivityDate.getTime() < yesterday.getTime()) {
        functions.logger.log(
          `User ${doc.id} missed a day. Last active: ${lastActivityDate.toISOString()}`,
        );
        if (gamification.streakFreezes > 0) {
          // A. USE A STREAK FREEZE
          updates['gamification.streakFreezes'] =
            admin.firestore.FieldValue.increment(-1);
          updates['gamification.isStreakProtected'] = true; // Set the flag for the UI
          functions.logger.log(`Used a streak freeze for user ${doc.id}.`);
        } else {
          // B. RESET THE STREAK
          updates['gamification.currentStreak'] = 0;
          functions.logger.log(`Reset streak for user ${doc.id}.`);
        }
      }

      // --- Weekly XP Reset Logic ---
      // getUTCDay() returns 1 for Monday
      if (today.getUTCDay() === 1) {
        updates['gamification.xpWeekly'] = 0;
      }

      // Add the updates to the batch if there are any
      if (Object.keys(updates).length > 0) {
        batch.update(userRef, updates);
        usersProcessed++;
      }
    });

    await batch.commit();
    functions.logger.info(
      `Daily gamification update completed. Processed ${usersProcessed} users.`,
    );
    return null;
  });

// ===================================================================
// HOURLY ACTIVITY REMINDER - SCHEDULED FUNCTION
// ===================================================================
/**
 * A scheduled function that runs every hour to send activity reminders.
 * It calculates which timezones in the world are currently at 11:00 AM
 * and sends personalized push notifications to inactive users in those zones.
 */
export const hourlyActivityReminder = functions.pubsub
  .schedule('every 1 hours from 00:00 to 23:00') // Runs on the hour, every hour
  .timeZone('UTC') // Always run scheduled jobs on a stable, universal timezone
  .onRun(async () => {
    const notificationHour = 11; // The local hour we want to send the notification (11 AM)
    const now = new Date(); // The current time in UTC

    functions.logger.info(`Running hourly check at ${now.toUTCString()}`);

    // 1. --- Identify Target Timezones ---
    // Find all IANA timezones where the local time is currently 11:xx AM.
    const allTimezones: { name: string }[] = moment.tz
      .names()
      .map((tz) => ({ name: tz }));

    const targetTimezones = allTimezones
      .filter((tz) => {
        // Use `toZonedTime` to get a Date object representing the time in the target zone
        const localTime = toZonedTime(now, tz.name);
        return localTime.getHours() === notificationHour;
      })
      .map((tz) => tz.name);

    if (targetTimezones.length === 0) {
      functions.logger.info(
        'No timezones are currently at 11 AM. Exiting job for this hour.',
      );
      return null;
    }
    functions.logger.info(
      `Targeting ${targetTimezones.length} timezones at 11 AM: ${targetTimezones.join(', ')}`,
    );

    // 2. --- Query for Users in Target Timezones ---
    // Note: Firestore 'in' query is limited to 30 values. This is fine as there are never
    // more than 30 timezones at the same hour.
    const usersSnapshot = await db
      .collection('users')
      .where('timezone', 'in', targetTimezones)
      .get();

    if (usersSnapshot.empty) {
      functions.logger.info('No users found in the target timezones.');
      return null;
    }

    // 3. --- Process Each User to Check for Activity ---
    const notificationPromises = [];

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      const userId = doc.id;

      // --- Timezone-aware Activity Check ---
      // We need to know the start of the user's *local* day to check against their last activity.
      // This is a reliable way to do it without an extra library for this specific check.
      const startOfUserLocalDay = new Date(
        now.toLocaleString('en-US', { timeZone: user.timezone }),
      );
      startOfUserLocalDay.setHours(0, 0, 0, 0);

      const gamification = user.gamification || {};
      const lastActivityTs =
        gamification.lastActivityDate as admin.firestore.Timestamp;
      const hasBeenActiveToday =
        lastActivityTs && lastActivityTs.toDate() >= startOfUserLocalDay;

      // 4. --- If Inactive, Craft and Schedule the Notification ---
      if (!hasBeenActiveToday) {
        const streak = gamification.currentStreak || 0;
        let title = 'Time for your daily activity! 🔥';
        let body =
          'A quick workout is all it takes to earn XP, Gems, and keep your streak going!';

        // Personalize the message for users with an active streak
        if (streak > 3) {
          title = `Keep your ${streak}-day streak alive! 🔥`;
          body = `Just one activity today will protect your amazing streak and earn you more rewards. You can do it!`;
        }

        // Correctly invoke the internal notification function and add its
        // returned Promise to our array for parallel execution.
        const fakeContext: functions.https.CallableContext = {
          auth: { uid: 'some-user-id', token: {} as any }, // simulate auth context
          rawRequest: {} as any, // if needed
          instanceIdToken: undefined,
          app: undefined,
        };
        // Add the call to your individual notification function to the promise array
        notificationPromises.push(
          pushNotificationsFunctions.sendUserPushNotification(
            {
              userId,
              title,
              body,
              language: 'en',
            },
            fakeContext,
          ),
        );
      }
    }

    // 5. --- Send All Notifications ---
    // By awaiting Promise.all, we wait for all the individual send operations to complete.
    await Promise.all(notificationPromises);

    if (notificationPromises.length > 0) {
      functions.logger.info(
        `Successfully queued ${notificationPromises.length} activity reminder notifications.`,
      );
    } else {
      functions.logger.info(
        'All users in target timezones were already active today.',
      );
    }

    return null;
  });
