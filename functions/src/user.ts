import { addDays } from 'date-fns';
import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
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
      return throwHttpsError('unauthenticated', t.common.notAuthorized);
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

// function used to update user collection fields
const updateUserHandler = async (data: {
  userId: string;
  language: string;
  fieldsToUpdate: object;
}) => {
  let t;
  try {
    const { userId, language } = data;
    const userDoc = db.collection('users').doc(userId);
    t = getTranslation(language);

    await userDoc.update(data.fieldsToUpdate);

    return { message: t.updateUser.successUpdatedUser };
  } catch (error: any) {
    t = t || getTranslation('en');

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
        `Starting 7-day trial for anonymous user ${userId}`,
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
      const trialEndDate = addDays(now, 7);

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

export {
  checkEmailExistsHandler,
  getUserInfo,
  loginUserAnonymouslyHandler,
  startFreeTrialHandler,
  updateUserHandler,
};
