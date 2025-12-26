import { ITranslation } from './types';

export const en: ITranslation = {
  common: {
    welcome: 'Welcome',
    error: 'An error occurred',
    loading: 'Loading...',
    noUserFound: 'You are not authorized to make this request. Please log in',
    userIdMissing:
      'It looks like the user id is missing. Please provide it to proceed',
    scanLimitReached:
      'You’ve reached the maximum number of scans allowed. Please upgrade your plan to continue using the service',
    mandatoryLanguage: 'The language code is required',
  },
  loginUserAnonymously: {
    mandatoryUsername: "Choose a nickname and let's get started!",
    userLoggedIn: "Welcome back! You're in.",
    accountCreated: "You're in! Enjoy exploring!",
    error:
      'Oops! Something went wrong. Please check your connection and try again.',
  },
  getUserInfo: {
    successGetInfo: 'Successfully fetched userInfo data',
    errorGetInfo:
      'An unexpected error occurred while fetching user information. Please try again later',
  },
  getUserInfoById: {
    noUserInfoData: 'The user document exists, but no data is available',
    getUserFetchError: 'An error occurred while fetching the user information',
  },
  updateUser: {
    successUpdatedUser: 'User updated successfully',
    updateUserError: 'Unable to update the user record. Please try again.',
  },
  updateUserLanguage: {
    updateSuccess: 'Successfully updated the language!',
    updateError:
      'An unexpected error occurred while updating the language. Please try again later',
  },
  analyzeImage: {
    scanLimitReached:
      'You’ve reached the maximum number of scans allowed. Please upgrade your plan to continue using the service',
    imageMissing: 'Image missing. Please select and upload an image to proceed',
    uploadImageStorageError:
      'We encountered an error while uploading your image. Please check your connection and try again',
    interpretationNotSaved:
      'Unable to save the analysis result. Please check your connection and try again',
    analysisCompleted: 'Image analysis completed successfully!',
  },
  continueConversation: {
    messagesLimit:
      'Mojo’s at full capacity! Upload another scan to keep getting analysis and insights',
    conversationNotFound: 'Unable to find the conversation',
    serviceIssueAi:
      'There seems to be an issue with the AI service. Please try again.',
    noResponseAiService:
      'Failed to get a valid response from the AI service. Please try again',
  },
  sendGlobalPushNotifications: {
    requiredParams: 'Notification title and body are mandatory.',
    generalError: 'An error occurred while processing notifications',
    generalErrorAdditional: 'Failed to send global notification',
  },
  getUserNotification: {
    generalError: 'Failed to fetch user notifications',
    generalErrorAdditional:
      'An error occurred while fetching user notifications',
  },
  sendUserNotification: {
    noTokenFound: 'No valid Expo tokens found. Unable to send notifications',
    generalError: 'Failed to send notification',
  },
  checkDeviceUniqueIdentifier: {
    deviceMandatory: 'Device ID is mandatory',
    languageMandatory: 'Language is mandatory',
    deviceIdentified: 'Your device has been identified successfully',
    generalError: 'An error occurred while checking device trial',
  },

  storeDeviceToken: {
    deviceTokenRequired: 'Providing a device token is mandatory.',
    generalError: 'Error storing device token',
  },
} as any;
