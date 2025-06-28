/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from 'firebase-functions/logger';
import * as functions from 'firebase-functions/v1';

import * as activityLogsFunctions from './activity-logs';
import * as conversationFunctions from './conversation';
import * as excuseBusterFunctions from './excuse-buster';
import * as pushNotificationsFunctions from './push-notifications';
import * as scanImageFunctions from './scan';
import * as aiTasksFunctions from './tasks';
import * as userFunctions from './user';

const usCentralFunctions = functions.region('us-central1');

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
