/* eslint-disable valid-jsdoc */
// utils/errors.ts
import * as functions from 'firebase-functions/v1';

interface ErrorDetails {
  [key: string]: any;
}

/**
 * Throws an HttpsError with a specified code, message, and optional details.
 * This function centralizes the creation and throwing of HttpsError for consistency.
 *
 * @param code The error code (e.g., "invalid-argument", "internal", "unauthenticated").
 * @param message The error message to be sent to the client.
 * @param details Optional, additional details to include with the error.
 */
export function throwHttpsError(
  code: functions.https.FunctionsErrorCode,
  message: string,
  details?: ErrorDetails,
): never {
  throw new functions.https.HttpsError(code, message, details);
}

/**
 * Handles unexpected errors by converting them into an HttpsError.
 * This is useful in a catch block to ensure all errors are consistently
 * transformed into a format consumable by the client.
 *
 * @param error The error object caught in a try-catch block.
 * @param t The translation function or object to get error messages.
 * @param defaultMessageKey The key for the default error message in the translation object.
 * @param functionName Optional, the name of the function where the error occurred for logging.
 */
export function handleAndThrowHttpsError(
  error: any,
  t: (key: string) => string, // Assuming t is a function that takes a key and returns a string
  defaultMessageKey: string,
  functionName?: string,
): never {
  const logMessage = functionName
    ? `${functionName} error:`
    : 'Unexpected error:';
  console.error(logMessage, error);

  if (error instanceof functions.https.HttpsError) {
    throw error; // Re-throw already correctly formatted HttpsErrors
  }

  // You can add more specific error handling here for known error types (e.g., Firebase Auth errors)
  if (
    error.code &&
    typeof error.code === 'string' &&
    error.code.startsWith('auth/')
  ) {
    // Example: Firebase Auth specific errors
    let errorMessage = t(defaultMessageKey); // Default message
    switch (error.code) {
      case 'auth/email-already-exists':
        errorMessage = t('auth.emailAlreadyExists'); // Assuming you have this translation
        break;
      case 'auth/invalid-email':
        errorMessage = t('auth.invalidEmail');
        break;
      // Add more cases as needed
    }
    throw new functions.https.HttpsError('unauthenticated', errorMessage, {
      originalError: error.message,
      errorCode: error.code,
    });
  }

  throw new functions.https.HttpsError('internal', t(defaultMessageKey), {
    message: error.message || 'Unknown error occurred.',
    originalError: error.toString(), // Include the original error for debugging on the client if needed
  });
}

export const logError = (context: string, errorDetails: any) => {
  // Use Firebase's logger to log structured errors
  functions.logger.error(`[${context}]`, errorDetails);
};
export const handleOnRequestError = ({
  error,
  res,
  context = 'Global Error Handler',
}: {
  error: any;
  res: any;
  context?: string;
}) => {
  logError(context, {
    name: error?.name || '',
    message: error.message || '',
    stack: error?.stack || '',
    statusCode: error?.statusCode || 500,
    statusMessage: error?.statusMessage || 'Internal Server Error',
  });

  res.status(500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errorBody: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Internal Server Error',
    },
  });
};
