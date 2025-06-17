import { getAnalytics } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { type FirebaseAuthTypes, getAuth } from '@react-native-firebase/auth';
import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { getFirestore } from '@react-native-firebase/firestore';
import {
  firebase,
  type FirebaseFunctionsTypes,
} from '@react-native-firebase/functions';
import { getStorage } from '@react-native-firebase/storage';

// Initialize Firebase (no need for config if you're using default options from GoogleService-Info.plist and google-services.json)

// Get instances of the services
const firebaseApp = getApp();
const firebaseAuth: FirebaseAuthTypes.Module = getAuth();
const firebaseFirestore = getFirestore();
const firebaseStorage = getStorage();
const firebaseCrashlytics = getCrashlytics();
const firebaseAnalytics = getAnalytics();

const getCloudFunctionInstance = (
  isEmulatorEnabled: boolean = false
): FirebaseFunctionsTypes.Module => {
  const wrapper = firebase.app().functions('us-central1');
  if (__DEV__ && isEmulatorEnabled) {
    /*
    Use the emulator if in development mode
    make sure that emulator/start runs and npm run build is in watch mode build:watch
    */
    wrapper.useEmulator('localhost', 5001);
  }
  return wrapper;
};

const firebaseCloudFunctionsInstance = getCloudFunctionInstance();

export {
  firebaseAnalytics,
  firebaseApp,
  firebaseAuth,
  firebaseCloudFunctionsInstance,
  firebaseCrashlytics,
  firebaseFirestore,
  firebaseStorage,
};
