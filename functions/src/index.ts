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

import { fakeContext } from '../utilities/fake-context';
import * as activityLogsFunctions from './activity-logs';
import { admin } from './common';
import * as conversationFunctions from './conversation';
import * as excuseBusterFunctions from './excuse-buster';
import {
  addMacroEntryHandler,
  deleteMacroEntryHandler,
  getDailyMacrosHandler,
  getMacroDateRangeHandler,
  updateMacroEntryHandler,
} from './macro';
import * as progressFunctions from './progress';
import * as pushNotificationsFunctions from './push-notifications';
import * as scanImageFunctions from './scan';
import * as shopItemsFunctions from './shop-items';
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

export const updatePreferredLanguage = usCentralFunctions.https.onCall(
  userFunctions.handleUpdateUserLanguage,
);

export const updateUser = usCentralFunctions.https.onCall(
  userFunctions.updateUserHandler,
);

export const checkEmailExist = usCentralFunctions.https.onCall(
  userFunctions.checkEmailExistsHandler,
);
export const startFreeTrial = usCentralFunctions.https.onCall(
  userFunctions.startFreeTrialHandler,
);
export const deleteUserAccountPermanently = usCentralFunctions.https.onCall(
  userFunctions.deleteUserAccount,
);

/** ActivityLogs collection cloud functions  */

export const createActivityLog = usCentralFunctions.https.onCall(
  activityLogsFunctions.createActivityLogHandler,
);

export const getCalendarActivityLog = usCentralFunctions.https.onCall(
  activityLogsFunctions.getCalendarActivityLogHandler,
);

export const updateActivityLog = usCentralFunctions.https.onCall(
  activityLogsFunctions.updateActivityLogHandler,
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

export const getAllUserConversations = usCentralFunctions.https.onCall(
  conversationFunctions.getUserConversationsHandler,
);

export const sendChatMessage = usCentralFunctions.https.onCall(
  conversationFunctions.sendChatMessageHandler,
);
export const getAllConversations = usCentralFunctions.https.onCall(
  conversationFunctions.getAllConversationsHandler,
);
/** excuse buster conversation collection cloud functions  */
export const getExcuseBusterConversationMessages =
  usCentralFunctions.https.onCall(
    excuseBusterFunctions.getExcuseBusterConversationHandler,
  );
export const continueExcuseBusterConversation = usCentralFunctions.https.onCall(
  excuseBusterFunctions.continueExcuseBusterConversation,
);
export const getAllExcuseBusterConversations = usCentralFunctions.https.onCall(
  excuseBusterFunctions.getAllUserExcuseBusterConversationsHandler,
);
/** Macro cloud functions  */

export const addMacroEntry =
  usCentralFunctions.https.onCall(addMacroEntryHandler);

export const updateMacroEntry = usCentralFunctions.https.onCall(
  updateMacroEntryHandler,
);

export const deleteMacroEntry = usCentralFunctions.https.onCall(
  deleteMacroEntryHandler,
);

export const getDailyMacros = usCentralFunctions.https.onCall(
  getDailyMacrosHandler,
);

export const getMacroDateRange = usCentralFunctions.https.onCall(
  getMacroDateRangeHandler,
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

export const updateAiTaskNotes = usCentralFunctions.https.onCall(
  aiTasksFunctions.updateAiTaskNotesHandler,
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
/** Progress  */
export const getProgressAnalytics = usCentralFunctions.https.onCall(
  progressFunctions.getProgressAnalyticsHandler,
);
/** shop items  */
export const seedShopItems = usCentralFunctions.https.onCall(
  shopItemsFunctions.seedShopItemsHandler,
);
export const getShopItems = usCentralFunctions.https.onCall(
  shopItemsFunctions.getShopItemsHandler,
);
export const getOwnPurchasedItems = usCentralFunctions.https.onCall(
  shopItemsFunctions.getPurchasedItemsHandler,
);
export const purchaseShopItem = usCentralFunctions.https.onCall(
  shopItemsFunctions.purchaseShopItemHandler,
);
export const repairStreak = usCentralFunctions.https.onCall(
  shopItemsFunctions.repairStreakHandler,
);

/**
 * A scheduled function that runs every day shortly after midnight (UTC).
 * It now works in two phases:
 * 1. Identify users who missed a day, and immediately send them a notification
 *    about their streak status (saved by a freeze or lost).
 * 2. Process all database updates for streaks, freezes, and weekly XP in a single batch.
 */
export const dailyGamificationUpdate = functions.pubsub
  .schedule('every day 09:00') // Run at a safe time after midnight (00:10 used before)
  .timeZone('UTC') // Use a consistent global timezone
  .onRun(async () => {
    functions.logger.info('Starting daily gamification update...');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalize to the beginning of the day in UTC
    const todayISOString = today.toISOString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Get the beginning of yesterday

    const batch = db.batch();
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      functions.logger.info('No users found. Exiting.');
      return null;
    }

    // --- Phase 1: Identify & Prepare Notifications and Updates ---

    // An array to hold all the notification tasks (Promises)
    const notificationPromises = [];
    // An array to hold all the activity logs tasks (Promises)
    // An array to hold all the database update operations
    const userUpdates: { userId: string; updates: { [key: string]: any } }[] =
      [];
    // Array to hold streak freeze potion updates that need to be processed separately
    const freezePotionUpdates: { userId: string; shouldDecrement: boolean }[] =
      [];

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      const userId = doc.id;
      const gamification = user.gamification || {};
      const lastActivityTs =
        gamification.lastActivityDate as admin.firestore.Timestamp;

      if (!lastActivityTs) continue; // Skip users with no activity yet

      const lastActivityDate = lastActivityTs.toDate();
      lastActivityDate.setUTCHours(0, 0, 0, 0);

      const updates: { [key: string]: any } = {};
      // Always queue the reset of the protection flag for every active user
      updates['gamification.isStreakProtected'] = false;

      // Clear any expired streak repair state from the previous day
      const repairTimestamp = gamification.lostStreakTimestamp;
      if (repairTimestamp) {
        const repairDate = new Date(repairTimestamp); // Convert the ISO string to a Date object
        const hoursSinceLost =
          (new Date().getTime() - repairDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLost > 48) {
          // 48-hour window
          updates['gamification.lostStreakValue'] =
            admin.firestore.FieldValue.delete();
          updates['gamification.lostStreakTimestamp'] =
            admin.firestore.FieldValue.delete();
        }
      }
      // --- Core Streak Logic ---
      // Check if the last activity was before yesterday (i.e., they missed yesterday)
      if (lastActivityDate.getTime() < yesterday.getTime()) {
        const streak = gamification.currentStreak || 0;
        functions.logger.log(
          `User ${userId} missed a day. Current streak: ${streak}.`,
        );

        if (gamification.streakFreezes > 0) {
          // A. USE A STREAK FREEZE
          updates['gamification.streakFreezes'] =
            admin.firestore.FieldValue.increment(-1);
          updates['gamification.isStreakProtected'] = true; // Set flag for UI
          updates['gamification.streakFreezeUsageDates'] =
            admin.firestore.FieldValue.arrayUnion(todayISOString);

          // Mark this user for streak freeze potion decrement
          freezePotionUpdates.push({ userId, shouldDecrement: true });

          // Queue the "Streak Saved" notification
          const title = 'Your Streak is Safe! 🥶';
          const body = `You missed a day, but your Streak Freeze was used to save your ${streak}-day streak. Phew!`;
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
        } else if (streak > 0) {
          // Only send a "lost" notification if they actually had a streak to lose
          // B. RESET THE STREAK
          const resetISOString = today.toISOString();
          updates['gamification.longestStreak'] =
            gamification.currentStreak > gamification.longestStreak
              ? gamification.currentStreak
              : gamification.longestStreak;
          updates['gamification.currentStreak'] = 0;
          updates['gamification.streakResetDates'] =
            admin.firestore.FieldValue.arrayUnion(resetISOString);
          updates['gamification.lostStreakValue'] = streak;
          updates['gamification.lostStreakTimestamp'] = resetISOString;

          // Queue the "Streak Lost" notification
          const title = 'Oh no, you lost your streak! 😢';
          const body = `You missed your activity yesterday and lost your ${streak}-day streak. Don't worry, you can start a new one today!`;
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

      // --- Weekly XP Reset Logic ---
      if (today.getUTCDay() === 1) {
        // 1 = Monday
        updates['gamification.xpWeekly'] = 0;
      }

      // Add the prepared updates to our array for batch processing later
      userUpdates.push({ userId, updates });
    }

    // --- Execute all notifications first ---
    // We await all notification promises. This ensures all notifications are sent
    // out before we modify the database state.
    if (notificationPromises.length > 0) {
      functions.logger.info(
        `Sending ${notificationPromises.length} streak status notifications.`,
      );
      await Promise.all(notificationPromises);
      functions.logger.info('All notifications have been sent.');
    }
    // --- Phase 2: Process Streak Freeze Potion Updates ---
    // Handle streak freeze potion updates separately to avoid batch failures
    if (freezePotionUpdates.length > 0) {
      functions.logger.info(
        `Processing streak freeze potion updates for ${freezePotionUpdates.length} users.`,
      );

      const potionUpdatePromises = freezePotionUpdates.map(
        async ({ userId, shouldDecrement }) => {
          if (!shouldDecrement) return;

          const userRef = db.collection('users').doc(userId);
          const freezePotionRef = userRef
            .collection('ownedItems')
            .doc('STREAK_FREEZE_POTION');

          try {
            // Use a transaction to safely handle the potion quantity update
            await db.runTransaction(async (transaction) => {
              const potionDoc = await transaction.get(freezePotionRef);

              if (potionDoc.exists) {
                const currentQuantity = potionDoc.data()?.quantity || 0;
                if (currentQuantity > 0) {
                  transaction.update(freezePotionRef, {
                    quantity: admin.firestore.FieldValue.increment(-1),
                  });
                } else {
                  functions.logger.warn(
                    `User ${userId} has streak freeze potion document but quantity is ${currentQuantity}. Skipping decrement.`,
                  );
                }
              } else {
                // If the document doesn't exist, create it with quantity 0
                // This prevents future errors and maintains data consistency
                transaction.set(freezePotionRef, {
                  quantity: 0,
                  shopItemId: 'STREAK_FREEZE_POTION',
                  purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                  handledByJob: true,
                });
                functions.logger.warn(
                  `User ${userId} missing streak freeze potion document. Created with quantity 0.`,
                );
              }
            });
          } catch (error) {
            functions.logger.error(
              `Failed to update streak freeze potion for user ${userId}:`,
              error,
            );
            // Continue processing other users even if one fails
          }
        },
      );

      await Promise.all(potionUpdatePromises);
      functions.logger.info('Streak freeze potion updates completed.');
    }

    // --- Phase 3: Commit all Database Updates ---
    let usersProcessed = 0;

    userUpdates.forEach(({ userId, updates }) => {
      if (Object.keys(updates).length > 0) {
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, updates);
        usersProcessed++;
      }
    });

    if (usersProcessed > 0) {
      try {
        await batch.commit();
        functions.logger.info(
          `Database updates completed for ${usersProcessed} users.`,
        );
      } catch (error) {
        functions.logger.error('Failed to commit batch updates:', error);
        throw error; // Re-throw to trigger Cloud Functions retry
      }
    } else {
      functions.logger.info('No database updates were needed.');
    }

    functions.logger.info('Daily gamification update completed successfully.');
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
    const notificationHour = 14; // The local hour we want to send the notification (it was 11 AM)
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

    // 2. --- Query for Users in Target Timezones (with batching) ---
    // Firestore 'in' query is limited to 30 values, so we need to batch when there are more
    const batchSize = 30;
    const timezoneBatches = [];

    for (let i = 0; i < targetTimezones.length; i += batchSize) {
      timezoneBatches.push(targetTimezones.slice(i, i + batchSize));
    }

    // Execute all batched queries in parallel
    const batchPromises = timezoneBatches.map((batch) =>
      db.collection('users').where('timezone', 'in', batch).get(),
    );

    const batchSnapshots = await Promise.all(batchPromises);

    // Combine all results
    const allUserDocs = batchSnapshots.flatMap((snapshot) => snapshot.docs);

    if (allUserDocs.length === 0) {
      functions.logger.info('No users found in the target timezones.');
      return null;
    }

    functions.logger.info(
      `Found ${allUserDocs.length} users in target timezones.`,
    );

    // 3. --- Process Each User to Check for Activity ---
    const notificationPromises = [];

    for (const doc of allUserDocs) {
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
// ===================================================================
// FUNCTION 1: The "Last Chance" Warning Notifier
// This function runs every hour to find users whose local time is 6 PM
// and warns them if their streak is at risk.
// ===================================================================
/**
 * A scheduled function that runs every hour to send "last chance" streak warnings.
 * It targets users whose local time is 6 PM (18:00) and who have not yet
 * completed an activity for the current day.
 */
export const streakWarningNotifier = functions.pubsub
  .schedule('every 1 hours from 00:00 to 23:00')
  .timeZone('UTC')
  .onRun(async () => {
    const warningHour = 19; // 19 PM local time
    const now = new Date();

    functions.logger.info(
      `Running streak warning check at ${now.toUTCString()}`,
    );

    // 1. --- Identify Target Timezones ---
    // Find all IANA timezones where the local time is currently 6 PM.
    const allTimezones: { name: string }[] = moment.tz
      .names()
      .map((tz) => ({ name: tz }));

    const targetTimezones = allTimezones
      .filter((tz) => {
        // Use `toZonedTime` to get a Date object representing the time in the target zone
        const localTime = toZonedTime(now, tz.name);
        return localTime.getHours() === warningHour;
      })
      .map((tz) => tz.name);

    if (targetTimezones.length === 0) {
      functions.logger.info('No timezones are at 6 PM. Exiting.');
      return null;
    }

    functions.logger.info(
      `Targeting timezones for 6 PM warning: ${targetTimezones.join(', ')}`,
    );

    // 2. --- Query for Users in Target Timezones (with batching) ---
    // Firestore 'in' query is limited to 30 values, so we need to batch when there are more
    const batchSize = 30;
    const timezoneBatches = [];

    for (let i = 0; i < targetTimezones.length; i += batchSize) {
      timezoneBatches.push(targetTimezones.slice(i, i + batchSize));
    }

    // Execute all batched queries in parallel
    const batchPromises = timezoneBatches.map((batch) =>
      db
        .collection('users')
        .where('timezone', 'in', batch)
        .where('gamification.currentStreak', '>', 0) // Only warn users who have a streak to lose
        .get(),
    );

    const batchSnapshots = await Promise.all(batchPromises);

    // Combine all snapshots into a single array of documents
    const allDocs = batchSnapshots.flatMap((snapshot) => snapshot.docs);

    if (allDocs.length === 0) {
      functions.logger.info(
        'No users with active streaks found in target timezones.',
      );
      return null;
    }

    const notificationPromises = [];

    for (const doc of allDocs) {
      const user = doc.data();
      const userId = doc.id;

      // --- Check if they've been active *today* (their local today) ---
      // This is a reliable way to get the start of the user's local day
      const startOfUserLocalDay = new Date(
        now.toLocaleString('en-US', { timeZone: user.timezone }),
      );
      startOfUserLocalDay.setHours(0, 0, 0, 0);

      const gamification = user.gamification || {};
      const lastActivityTs =
        gamification.lastActivityDate as admin.firestore.Timestamp;
      const hasBeenActiveToday =
        lastActivityTs && lastActivityTs.toDate() >= startOfUserLocalDay;

      // --- If inactive, send the warning notification ---
      if (!hasBeenActiveToday) {
        const streak = gamification.currentStreak || 0;
        const freezes = gamification.streakFreezes || 0;

        const title = `🚨 Streak Alert! Your ${streak}-day streak is in danger!`;
        let body = `Complete any activity before midnight to keep your streak alive. You can do it!`;

        if (freezes > 0) {
          body = `Complete an activity before midnight to save your streak, or your Streak Freeze 🥶 will be used automatically.`;
        }

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

    await Promise.all(notificationPromises);
    functions.logger.info(
      `Sent ${notificationPromises.length} streak warning notifications.`,
    );
    return null;
  });
