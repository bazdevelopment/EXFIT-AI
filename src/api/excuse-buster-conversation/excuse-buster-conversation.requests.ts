import { firebaseCloudFunctionsInstance } from 'firebase/config';

export const fetchExcuseBusterConversation = async ({
  conversationId,
}: {
  conversationId: string;
}) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getExcuseBusterConversationMessages'
    )({ conversationId });
    return data.conversation;
  } catch (error) {
    throw error;
  }
};

export const getAllUserExcuseBusterConversations = async ({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getAllExcuseBusterConversations'
    )({
      userId,
      limit,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendExcuseBusterConversationMessage = async ({
  userMessage,
  conversationId,
  conversationMode,
  userId,
  language,
}: {
  userMessage: string;
  conversationId: string;
  conversationMode: string;
  userId: string;
  language: string;
}) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'continueExcuseBusterConversation'
    )({ userId, conversationId, userMessage, conversationMode, language });

    return data;
  } catch (e) {
    throw e;
  }
};
