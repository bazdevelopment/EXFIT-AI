import { sendSignInLinkToEmail } from '@react-native-firebase/auth';
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
}: {
  username: string;
  language: string;
  actualUserId: string;
}) => {
  try {
    const { data }: { data: any } =
      await firebaseCloudFunctionsInstance.httpsCallable(
        'loginUserAnonymously'
      )({
        username,
        language,
        actualUserId,
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
    return data;
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
}: UpgradePayload): Promise<void> => {
  console.log('auth', firebaseAuth.currentUser);
  const currentUserId = firebaseAuth?.currentUser?.uid;

  if (!currentUserId) {
    throw new Error('No anonymous user is currently signed in.');
  }

  // 1. Pre-check if email exists using our cloud function
  // This helps prevent sending links to already registered emails (for security/UX)
  const data = await checkEmail({ email });

  console.log('data check email', data);
  if (data.exists) {
    throw new Error('This email address is already in use.');
  }

  // 2. Define action code settings for the email link
  // IMPORTANT: For React Native, this URL should be a deep link that your app is configured to handle.
  // You will need to set up deep linking in your React Native project using Universal Links (iOS)
  // and Android App Links, or a third-party deep linking service.
  const actionCodeSettings = {
    // This URL is the deep link that will open your React Native app.
    // Replace 'your-app-scheme' with your actual deep link scheme (e.g., 'myapp://').
    // Example: 'yourapp://complete-sign-in?uid=' + currentUserId
    url: `https://exfit-ai-dev-9d0fe.firebaseapp.com/scan`,
    handleCodeInApp: true, // This must be set to true for the link to be handled by your app
    // You should also configure iOS and Android specific settings for Universal Links / Android App Links.
    // These typically involve setting up associated domains (iOS) and intent filters with assetlinks.json (Android).
    iOS: {
      bundleId: 'com.exfit.development', // Replace with your iOS bundle ID
    },
    android: {
      packageName: 'com.exfit.development', // Replace with your Android package name
      installApp: true, // Set to true if you want the app to be installed from the Play Store
      minimumVersion: '1', // Minimum version of your app required to handle the link
    },
    // Firebase Dynamic Links are deprecated. Do not use dynamicLinkDomain.
    // Ensure your `url` points to a universal link or app link that your app can handle directly.
  };

  try {
    // 3. Send the passwordless sign-in link to the user's email
    await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);

    console.log(`Sign-in link sent to ${email}.`);

    // 4. Store the email using AsyncStorage for React Native
    // This is crucial to know which email to use when the user returns
    // from the email link to complete the sign-in process.
    // await AsyncStorage.setItem('emailForSignIn', email);

    // Note: At this point, the user's account is NOT yet linked.
    // The linking (and updating of Firestore) will happen when the user
    // clicks the email link and your app handles the sign-in completion.
    // You'll need to set up deep link handling in your React Native app
    // to call signInWithEmailLink when the user returns via the link.

    console.log('Email link sent successfully.');
    return; // Function completes successfully after sending email
  } catch (error: any) {
    console.error('Error sending sign-in link:', error);
    if (error.code === 'auth/invalid-email') {
      throw new Error('The email address is not valid.');
    }
    // Specific error for when the email is already in use
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already in use.');
    }
    throw new Error(
      'An unexpected error occurred while sending the sign-in link.'
    );
  }
};
