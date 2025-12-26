import { addDays } from 'date-fns';
import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { GAMIFICATION_REWARDS_CONFIG } from '../utilities/rewards-pricing';
import { admin } from './common';
import { getTranslation } from './translations';

const db = admin.firestore();

const loginUserAnonymouslyHandler = async (data: {
  language: string;
  username: string;
  actualUserId?: string; // Optional: The existing userId to check
  timezone: string;
}) => {
  let t;
  try {
    // Attempt to get translation early, or default if not possible
    t = getTranslation(data.language);

    // Validate username
    if (!data.username) {
      throwHttpsError(
        'invalid-argument',
        t.loginUserAnonymously.mandatoryUsername,
      );
    }

    const db = admin.firestore();
    let isNewUser = false;

    // Step 1: Check if actualUserId is provided and corresponds to an existing user
    if (data.actualUserId) {
      const existingUserDoc = await db
        .collection('users')
        .doc(data.actualUserId)
        .get();
      if (existingUserDoc.exists) {
        // Update the existing user's username
        await db.collection('users').doc(data.actualUserId).update({
          userName: data.username, // Update the username
          updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Update the timestamp
        });
        // Return the existing user's data
        const customToken = await admin
          .auth()
          .createCustomToken(data.actualUserId);
        return {
          userId: data.actualUserId,
          message: t.loginUserAnonymously.userLoggedIn,
          isNewUser: false,
          authToken: customToken,
        };
      }
    }

    // Step 2: If no existing user is found, create a new anonymous user
    const createdUser = await admin.auth().createUser({
      // No email or password needed for anonymous users
    });

    const newUserId = createdUser.uid;

    // Step 3: Create a new user document in Firestore
    await db
      .collection('users')
      .doc(newUserId)
      .set({
        userId: newUserId,
        timezone: data.timezone,
        isAnonymous: true, // Mark the user as anonymous
        subscribed: false, // Example field
        isActive: false, // Example field
        isOtpVerified: true, // Example field set to true for anonymous users
        isOnboarded: false, // Example field
        userName: data.username, // Store the provided username
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        preferredLanguage: data.language || 'en', // Use the provided language or default to 'en'
        completedScans: 0, // Example field
        email: '',
        profilePictureUrl: '',
        onboarding: {
          gender: '',
          fitnessGoals: [],
          experience: '',
        },
        gamification: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: '',
          gemsBalance: 0,
          xpTotal: 0,
          xpWeekly: 0,
          streakFreezes: 0,
          isStreakProtected: false,
          streakFreezeUsageDates: [],
          streakRepairDates: [],
          streakResetDates: [],
        },
        macroGoals: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      });

    isNewUser = true;

    // Step 4: Generate a custom token for the user
    const customToken = await admin.auth().createCustomToken(newUserId);

    return {
      userId: newUserId,
      message: isNewUser
        ? t.loginUserAnonymously.accountCreated
        : t.loginUserAnonymously.userLoggedIn,
      isNewUser,
      authToken: customToken,
    };
  } catch (error: any) {
    // Ensure 't' is defined before using it in handleAndThrowHttpsError
    // If getting translation also fails, this might need a more robust default mechanism.
    t = t || getTranslation('en');

    throwHttpsError('internal', t.loginUserAnonymously.error, {
      message: error.message || 'Unknown error occurred.',
    });
  }
};

// Function used to fetch the current logged in user by userId
const getUserInfo = async (data: { language: string }, context: any) => {
  let t;
  try {
    t = getTranslation(data.language);

    // Ensure user is authenticated
    if (!context.auth) {
      return throwHttpsError('unauthenticated', t.common.noUserFound);
    }
    const userId = context.auth?.uid;
    const userInfoData = await getUserInfoById(userId, data.language);
    return {
      ...userInfoData,
      verificationCodeExpiry: userInfoData?.verificationCodeExpiry
        ? userInfoData?.verificationCodeExpiry.toDate().toISOString()
        : '',
      createdAt: userInfoData?.createdAt?.toDate()?.toISOString(),
      updatedAt: userInfoData?.updatedAt?.toDate()?.toISOString(),
      message: t.getUserInfo.successGetInfo,
    };
  } catch (error: any) {
    t = t || getTranslation('en');

    throwHttpsError('internal', t.getUserInfo.errorGetInfo, {
      message: error.message || 'Unknown error occurred.',
    });
  }
};

const getUserInfoById = async (
  userId: string,
  language: string,
): Promise<any> => {
  let t;
  try {
    t = getTranslation(language);

    // Check if userId is valid
    if (!userId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        t.common.userIdMissing,
      );
    }

    // Fetch the user info from the database or service
    const userInfoData = await db.collection('users').doc(userId).get();
    // Ensure user data is not null/undefined
    if (!userInfoData.exists) {
      throw new functions.https.HttpsError(
        'data-loss',
        t.getUserInfoById.noUserInfoData,
      );
    }

    // Return the user info data
    return userInfoData.data();
  } catch (error: any) {
    t = t || getTranslation('en');

    // Handle errors and rethrow as HttpsError for consistency
    if (error instanceof functions.https.HttpsError) {
      throw error; // Rethrow known HttpsError
    }

    // Log the error for debugging purposes
    console.error('Error fetching user info:', error);

    // Throw a generic error for unexpected issues
    throw new functions.https.HttpsError(
      'unknown',
      t.getUserInfoById.getUserFetchError,
      { details: error.message },
    );
  }
};

/**
 * Updates a user document. If the update includes converting an anonymous account
 * to a permanent one, it atomically awards a sign-up bonus of gems and XP.
 *
 * @param {Object} data - The update payload containing userId, language, and fields to update.
 * @param {string} data.userId - The ID of the user to update.
 * @param {string} data.language - The preferred language for messages.
 * @param {Object} data.fieldsToUpdate - The fields to update in the user document.
 */
const updateUserHandler = async (data: {
  userId: string;
  language: string;
  // Use a more flexible type to allow adding new properties
  fieldsToUpdate: { [key: string]: any };
}) => {
  let t;
  try {
    const { userId, language, fieldsToUpdate } = data;
    const userDoc = db.collection('users').doc(userId);

    // This is our trigger condition: is the `isAnonymous` field being set to `false`?
    const isPermanentAccountCreated = fieldsToUpdate.isAnonymous === false;

    t = getTranslation(language);

    // --- REWARD LOGIC ---
    // If the account is being upgraded, add the rewards to the update payload.
    if (isPermanentAccountCreated) {
      functions.logger.info(
        `User ${userId} is being upgraded to permanent. Awarding sign-up bonus.`,
      );

      const GEMS_REWARD =
        GAMIFICATION_REWARDS_CONFIG.eventRewards.permanent_account_creation
          .gems;
      const XP_REWARD =
        GAMIFICATION_REWARDS_CONFIG.eventRewards.permanent_account_creation.xp;

      // Add the increment operations to the SAME update object.
      // We use dot notation to update nested fields within the 'gamification' map.
      // This is the safest way to add to a numeric value.
      fieldsToUpdate['gamification.gemsBalance'] =
        admin.firestore.FieldValue.increment(GEMS_REWARD);
      fieldsToUpdate['gamification.xpTotal'] =
        admin.firestore.FieldValue.increment(XP_REWARD);
    }

    // Perform a SINGLE atomic update with all the combined changes.
    // This will either update all fields or fail completely, ensuring data consistency.
    await userDoc.update(fieldsToUpdate);

    // The old `if (isPermanentAccountCreated)` block is no longer needed here.

    return {
      message: t.updateUser.successUpdatedUser,
    };
  } catch (error: any) {
    t = t || getTranslation('en'); // Ensure t is defined for error messages

    throwHttpsError(error.code, error.message, {
      message: error.message || t?.updateUser.updateUserError,
    });
  }
};

/**
 * A Callable Cloud Function to securely check if an email address
 * is already registered in Firebase Auth.
 *
 * @param {Object} data - The input data object.
 * @param {string} data.email - The email address to check.
 * @return {Object} An object indicating if the email exists.
 */
const checkEmailExistsHandler = async (data: {
  email: string;
}): Promise<{ exists: boolean }> => {
  if (!data.email) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      "The function must be called with an 'email' argument.",
    );
  }

  try {
    // This will throw an error if the user is not found.
    await admin.auth().getUserByEmail(data.email);
    // If the line above doesn't throw, the user exists.
    return { exists: true };
  } catch (error: any) {
    // 'auth/user-not-found' is the expected error for an available email.
    if (error.code === 'auth/user-not-found') {
      return { exists: false };
    }
    // Re-throw other unexpected errors.
    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred.',
    );
  }
};

/**
 * A callable Cloud Function that starts a trial for anonymous users.
 * Can be called from the client-side when needed.
 *
 * @param {Object} data - The input data object (not used in this function).
 * @param {Object} context - The callable function context, including authentication info.
 */
const startFreeTrialHandler = async (
  data: any,
  context: functions.https.CallableContext,
) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to start a trial',
    );
  }

  const userId = context.auth.uid;

  try {
    // Get the user document from Firestore
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throwHttpsError('not-found', 'User document not found.');
    }

    const userData = userDoc.data();

    // Check if the user is anonymous
    if (userData?.isAnonymous === true) {
      functions.logger.info(
        `Starting 3-day trial for anonymous user ${userId}`,
      );

      // Check if trial already exists
      if (userData.trial) {
        functions.logger.info(`Trial already exists for user ${userId}`);
        return {
          success: false,
          message: 'Trial already exists for this user',
          trial: userData.trial,
        };
      }

      const now = new Date();
      const trialEndDate = addDays(now, 3);

      // Prepare the trial data with ISO strings
      const trialData = {
        trial: {
          startDateISO: now.toISOString(),
          endDateISO: trialEndDate.toISOString(),
        },
      };

      // Update the user document with trial data
      await userDocRef.update(trialData);

      functions.logger.info(
        `Trial started for anonymous user ${userId}. Trial ends: ${trialEndDate.toISOString()}`,
      );

      return {
        success: true,
        message: 'Trial started successfully',
        trial: trialData.trial,
      };
    }

    // If the user is not anonymous, return error
    functions.logger.info(
      `Non-anonymous user ${userId} attempted to start trial`,
    );

    throwHttpsError(
      'failed-precondition',
      'Only anonymous users can start trials.',
    );
  } catch (error) {
    functions.logger.error(`Error starting trial for user ${userId}:`, error);

    // Re-throw HttpsError as-is, wrap other errors
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throwHttpsError('internal', 'Failed to start user trial');
  }
};

const deleteUserAccount = async (
  data: any,
  context: functions.https.CallableContext,
) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to delete account',
      );
    }

    const userId = context.auth.uid;
    console.log(`Starting account deletion for user: ${userId}`);

    // Start a batch operation for atomic deletion
    const batch = db.batch();
    let deletionCount = 0;

    // 1. Delete activityLogs subcollection from users collection
    try {
      const activityLogsRef = db
        .collection('users')
        .doc(userId)
        .collection('activityLogs');
      const activityLogsSnapshot = await activityLogsRef.get();

      if (!activityLogsSnapshot.empty) {
        activityLogsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          deletionCount++;
        });
        console.log(
          `Marked ${activityLogsSnapshot.size} activityLogs for deletion`,
        );
      }
    } catch (error) {
      console.error('Error deleting activityLogs:', error);
    }

    // 2. Delete from conversationsExcuseBuster collection
    try {
      const conversationsQuery = await db
        .collection('conversationsExcuseBuster')
        .where('userId', '==', userId)
        .get();

      if (!conversationsQuery.empty) {
        conversationsQuery.docs.forEach((doc) => {
          batch.delete(doc.ref);
          deletionCount++;
        });
        console.log(
          `Marked ${conversationsQuery.size} conversations for deletion`,
        );
      }
    } catch (error) {
      console.error('Error deleting conversations:', error);
    }

    // 3. Delete from interpretations collection
    try {
      const interpretationsQuery = await db
        .collection('interpretations')
        .where('userId', '==', userId)
        .get();

      if (!interpretationsQuery.empty) {
        interpretationsQuery.docs.forEach((doc) => {
          batch.delete(doc.ref);
          deletionCount++;
        });
        console.log(
          `Marked ${interpretationsQuery.size} interpretations for deletion`,
        );
      }
    } catch (error) {
      console.error('Error deleting interpretations:', error);
    }

    // 4. Delete from mobileDevices collection
    try {
      const mobileDevicesQuery = await db
        .collection('mobileDevices')
        .where('userId', '==', userId)
        .get();

      if (!mobileDevicesQuery.empty) {
        mobileDevicesQuery.docs.forEach((doc) => {
          batch.delete(doc.ref);
          deletionCount++;
        });
        console.log(
          `Marked ${mobileDevicesQuery.size} mobile devices for deletion`,
        );
      }
    } catch (error) {
      console.error('Error deleting mobile devices:', error);
    }

    // 5. Delete from notifications collection
    try {
      const notificationsQuery = await db
        .collection('notifications')
        .where('userId', '==', userId)
        .get();

      if (!notificationsQuery.empty) {
        notificationsQuery.docs.forEach((doc) => {
          batch.delete(doc.ref);
          deletionCount++;
        });
        console.log(`Marked notifications for deletion`);
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }

    // 6. Delete the main user document from users collection
    try {
      const userDocRef = db.collection('users').doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        batch.delete(userDocRef);
        deletionCount++;
        console.log('Marked user document for deletion');
      }
    } catch (error) {
      console.error('Error deleting user document:', error);
    }

    // Execute all deletions atomically
    if (deletionCount > 0) {
      await batch.commit();
      console.log(
        `Successfully deleted ${deletionCount} documents from Firestore`,
      );
    } else {
      console.log('No documents found to delete');
    }

    // 7. Delete user from Firebase Auth (this should be done last)
    try {
      await admin.auth().deleteUser(userId);
      console.log(`Successfully deleted user ${userId} from Firebase Auth`);
    } catch (error) {
      console.error('Error deleting user from Auth:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to delete user authentication',
      );
    }

    return {
      success: true,
      message: 'Account successfully deleted',
      documentsDeleted: deletionCount,
    };
  } catch (error) {
    console.error('Account deletion error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to delete account: ',
    );
  }
};

const handleUpdateUserLanguage = async (
  data: { language: string },
  context: any,
) => {
  let t;
  try {
    const { language } = data;
    t = getTranslation(language);
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        t.common.noUserFound,
      );
    }
    if (!language) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Language code is mandatory',
      );
    }
    const uid = context.auth?.uid;
    const userDoc = db.collection('users').doc(uid);

    await userDoc.update({ preferredLanguage: language });

    return { message: t.updateUserLanguage.updateSuccess, language };
  } catch (error) {
    t = t || getTranslation('en');

    throw new functions.https.HttpsError(
      'internal',
      t.updateUserLanguage.updateError,
    );
  }
};

export {
  checkEmailExistsHandler,
  deleteUserAccount,
  getUserInfo,
  handleUpdateUserLanguage,
  loginUserAnonymouslyHandler,
  startFreeTrialHandler,
  updateUserHandler,
};
