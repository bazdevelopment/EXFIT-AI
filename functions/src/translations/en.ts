import { ITranslation } from './types';

export const en: ITranslation = {
  common: {
    welcome: 'Welcome',
    notAuthorized: 'You are not authorized to make this request. Please log in',
    noUserFound: 'No user found. Please check your input and try again.',
    userIdMissing:
      'It looks like the user id is missing. Please provide it to proceed',
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
      'Aria’s at full capacity! Upload another scan to keep getting analysis and insights',
    conversationNotFound: 'Unable to find the conversation',
    serviceIssueAi:
      'There seems to be an issue with the AI service. Please try again.',
    noResponseAiService:
      'Failed to get a valid response from the AI service. Please try again',
  },
};
