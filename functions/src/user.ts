import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { admin } from './common';
import { getTranslation } from './translations';

const db = admin.firestore();

const loginUserAnonymouslyHandler = async (data: {
  language: string;
  username: string;
  actualUserId?: string; // Optional: The existing userId to check
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
          streakBalance: 0,
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

export {
  checkEmailExistsHandler,
  getUserInfo,
  loginUserAnonymouslyHandler,
  updateUserHandler,
};
