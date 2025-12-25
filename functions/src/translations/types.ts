export interface ITranslation {
  common: {
    welcome: string;
    notAuthorized: string;
    userIdMissing: string;
    noUserFound: string;
  };
  loginUserAnonymously: {
    mandatoryUsername: string;
    accountCreated: string;
    userLoggedIn: string;
    error: string;
  };
  getUserInfo: {
    successGetInfo: string;
    errorGetInfo: string;
  };
  getUserInfoById: {
    noUserInfoData: string;
    getUserFetchError: string;
  };
  updateUser: {
    successUpdatedUser: string;
    updateUserError: string;
  };
  analyzeImage: {
    scanLimitReached: string;
    imageMissing: string;
    uploadImageStorageError: string;
    interpretationNotSaved: string;
    analysisCompleted: string;
  };
  updateUserLanguage: {
    updateSuccess: string;
    updateError: string;
  };
  continueConversation: {
    messagesLimit: string;
    conversationNotFound: string;
    serviceIssueAi: string;
    noResponseAiService: string;
  };
  sendGlobalPushNotifications: {
    requiredParams: string;
    generalError: string;
    generalErrorAdditional: string;
  };

  checkDeviceUniqueIdentifier: {
    deviceMandatory: string;
    languageMandatory: string;
    deviceIdentified: string;
    generalError: string;
  };
  getUserNotification: {
    generalError: string;
    generalErrorAdditional: string;
  };
  sendUserNotification: {
    noTokenFound: string;
    generalError: string;
  };
  storeDeviceToken: {
    deviceTokenRequired: string;
    generalError: string;
  };
}
