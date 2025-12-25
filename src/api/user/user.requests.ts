import {
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { firebaseAuth, firebaseCloudFunctionsInstance } from 'firebase/config';

import Toast from '@/components/toast';
import { translate } from '@/core';

import { queryClient } from '../common';

/** Create anonymous account */
export const createAnonymousAccount = async ({
  username,
  language,
  actualUserId,
  timezone,
}: {
  username: string;
  language: string;
  actualUserId: string;
  timezone: string;
}) => {
  try {
    const { data }: { data: any } =
      await firebaseCloudFunctionsInstance.httpsCallable(
        'loginUserAnonymously'
      )({
        username,
        language,
        actualUserId,
        timezone,
      });

    // await firebaseAuth.signInAnonymously();

    const userCredentials = await firebaseAuth.signInWithCustomToken(
      data.authToken
    );

    return { ...userCredentials, ...data };
  } catch (error) {
    throw error;
  }
};

/** Create anonymous account */
export const loginWithEmail = async ({
  email,
  language,
}: {
  email: string;
  language: string;
}) => {
  try {
    const { data }: { data: any } =
      await firebaseCloudFunctionsInstance.httpsCallable('loginUserViaEmail')({
        email,
        language,
      });
    const userCredentials = await firebaseAuth.signInWithCustomToken(
      data.authToken
    );
    return userCredentials;
  } catch (error) {
    throw error;
  }
};

export const sendOtpCodeViaEmail = async ({
  email,
  language,
}: {
  email: string;
  language: string;
}) => {
  try {
    const sendEmailVerificationLink =
      firebaseCloudFunctionsInstance.httpsCallable(
        'sendVerificationCodeViaEmail'
      );
    const { data } = await sendEmailVerificationLink({
      email,
      language,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const validateVerificationCode = async ({
  authenticationCode,
  email,
  language,
}: {
  authenticationCode: string;
  email: string;
  language: string;
}) => {
  try {
    const verifyAuthenticationCode =
      firebaseCloudFunctionsInstance.httpsCallable('verifyAuthenticationCode');
    const { data } = await verifyAuthenticationCode({
      authenticationCode,
      email,
      language,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const decrementNumberOfScans = async ({
  language,
}: {
  language: string;
}) => {
  try {
    const handleDecrementScans =
      firebaseCloudFunctionsInstance.httpsCallable('decrementUserScans');
    const { data } = await handleDecrementScans({ language });

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserPreferredLanguage = async ({
  language,
}: {
  language: string;
}) => {
  try {
    const onUpdateLanguage = firebaseCloudFunctionsInstance.httpsCallable(
      'updatePreferredLanguage'
    );
    const { data } = await onUpdateLanguage({ language });

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserInfo = async ({
  language,
  userId,
  fieldsToUpdate,
}: {
  language: string;
  userId: string;
  fieldsToUpdate: object;
}) => {
  try {
    const onUpdateUserInfo =
      firebaseCloudFunctionsInstance.httpsCallable('updateUser');
    const { data } = await onUpdateUserInfo({
      userId,
      language,
      fieldsToUpdate,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

/** Get user info  */
export const getUserInfo = async ({ language }: { language: string }) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getUserInfo'
    )({ language });

    return data;
  } catch (error) {
    throw error;
  }
};

/** Get user info  */
export const checkEmail = async ({ email }: { email: string }) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'checkEmailExist'
    )({ email });
    return data as { exists: boolean };
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  await firebaseAuth.signOut();
  router.navigate('/anonymous-login');
  queryClient.clear(); // Clears all cached queries & mutations
  Toast.success(translate('alerts.loggedOutSuccess'));
};

interface UpgradePayload {
  email: string;
  password: string;
}

/**Upgrade to permanent account function */

export const createPermanentAccount = async ({
  email,
  password,
}: UpgradePayload): Promise<User> => {
  const currentUserId = firebaseAuth?.currentUser?.uid;

  if (!currentUserId) {
    throw new Error('No anonymous user is currently signed in.');
  }

  // 1. Pre-check if email exists using our cloud function
  const data = await checkEmail({ email });

  if (data.exists) {
    throw new Error('This email address is already in use.');
  }

  // 2. Create the new Email/Password credential
  const credential = EmailAuthProvider.credential(email, password);

  try {
    // 3. Link the new credential to the existing anonymous account
    const userCredential = await linkWithCredential(
      firebaseAuth.currentUser!,
      credential
    );

    // 4. Only update the user info if linking is successful
    await updateUserInfo({
      fieldsToUpdate: {
        email: userCredential.user.email,
        isAnonymous: false,
      },
      userId: currentUserId,
      language: 'en',
    });

    return userCredential.user;
  } catch (error: any) {
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/weak-password':
        throw new Error(
          'The password is too weak. Please use at least 6 characters.'
        );
      case 'auth/email-already-in-use':
        throw new Error('This email address is already in use.');
      case 'auth/provider-already-linked':
        throw new Error(
          'There is another account linked to this user. Please try to log in first'
        );
      default:
        throw new Error('An unexpected error occurred during signup.');
    }
  }
};

// --- Type Definitions for our functions ---
interface SignInPayload {
  email: string;
  password: string;
}

// --- 1. Sign-In Function ---

/**
 * Signs in a user with their email and password.
 * This function is designed to be used in a `useMutation` hook.
 *
 * @param {SignInPayload} payload - An object containing the user's email and password.
 * @returns {Promise<User>} A promise that resolves with the signed-in User object.
 * @throws {Error} Throws a user-friendly error message if sign-in fails.
 */
export const signInUser = async ({
  email,
  password,
}: SignInPayload): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    // We cast the error to AuthError to access the 'code' property safely
    const authError = error;

    // Provide user-friendly error messages based on the Firebase error code
    switch (authError.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': // This is a common code for wrong email/pass in recent SDK versions
        throw new Error('Invalid email or password. Please try again.');
      case 'auth/invalid-email':
        throw new Error('Please enter a valid email address.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled.');
      default:
        // A generic error for unexpected issues
        console.error('Unhandled Sign-In Error:', authError);
        throw new Error('An unexpected error occurred during sign-in.');
    }
  }
};

/**
 * Sends a password reset email to the provided email address.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<{success: boolean}>} A promise that resolves indicating success.
 * @throws {Error} Throws a user-friendly error message if the request fails.
 */
export const resetPassword = async ({
  email,
}: {
  email: string;
}): Promise<{ success: boolean }> => {
  try {
    // Firebase will send its standard password reset email from its own servers.
    await sendPasswordResetEmail(firebaseAuth, email);

    // For security reasons, always return success even if the user doesn't exist.
    // This prevents "email enumeration" attacks where someone could check
    // which emails are registered with your service.
    return { success: true };
  } catch (error) {
    const authError = error;

    // We only really need to handle the invalid email case.
    if (authError.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }

    // For all other errors, including 'auth/user-not-found', we fail silently
    // and return success to the user, as explained above.
    console.warn('Password reset error (failing silently):', authError.code);
    return { success: true };
  }
};

export const deleteAccount = async () => {
  try {
    const onDeleteAccountPermanently =
      firebaseCloudFunctionsInstance.httpsCallable(
        'deleteUserAccountPermanently'
      );
    const { data } = await onDeleteAccountPermanently();

    return data;
  } catch (error) {
    throw error;
  }
};
