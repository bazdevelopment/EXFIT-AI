/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions/v1";

import * as userFunctions from "./user";

const usCentralFunctions = functions.region("us-central1");

export const getHelloWorld = usCentralFunctions.https.onCall(
  (data, context) => {
    logger.info("Hello logs!", { structuredData: true });
    const req = context.rawRequest;
    const authorizationHeader = req.get("Authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
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
