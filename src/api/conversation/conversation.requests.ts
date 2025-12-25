import storage from '@react-native-firebase/storage';
import axios from 'axios';
import { firebaseCloudFunctionsInstance } from 'firebase/config';

import { Env } from '@/core/env';

export const fetchConversation = async ({
  conversationId,
}: {
  conversationId: string;
}) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getConversation'
    )({ conversationId });
    return data.conversation;
  } catch (error) {
    throw error;
  }
};

export const getAllUserConversations = async ({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getAllUserConversations'
    )({ userId, limit });
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendConversationMessage = async ({
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
    const response = await axios.post(
      Env.EXPO_PUBLIC_CONTINUE_CONVERSATION_ENDPOINT as string,
      {
        userId,
        conversationId,
        userMessage,
        conversationMode,
      },
      {
        headers: {
          Accept: 'application/json',
          // 'Content-Type': 'multipart/form-data',
          'Accept-Language': language,
        },
      }
    );

    return response.data;
  } catch (e) {
    throw e;
  }
};

/**
 * Legacy function to match your existing API
 * Analyzes multiple images/videos/PDFs using AI
 */

interface MediaFile {
  fileUri: string;
  id: string;
  url?: string; // If already uploaded
  type: 'image' | 'video' | 'pdf';
  mimeType?: string;
}
export const analyzeMultipleFilesUsingAI = async (payload: {
  mediaFiles: MediaFile[];
  language: string;
  userMessage: string;
  userId: string;
  conversationId?: string;
}) => {
  try {
    // Upload all files and get URLs
    const fileUrls = await uploadAllFiles(payload.mediaFiles, payload.userId);
    // Call cloud function
    const sendChatMessageFn =
      firebaseCloudFunctionsInstance.httpsCallable('sendChatMessage');
    const { data } = await sendChatMessageFn({
      userId: payload.userId,
      conversationId: payload.conversationId,
      userMessage: payload.userMessage,
      language: payload.language,
      fileUrls,
      history: [],
      includePreviousHistory: true,
    });
    return data;
  } catch (error) {
    console.error('Error analyzing files:', error);
    throw error;
  }
};

const uploadToFirebaseStorage = async (
  localPath: string,
  conversationId: string
): Promise<string> => {
  const fileName = localPath?.split('/').pop()!;
  const ref = storage().ref(`interpretations/${conversationId}/${fileName}`);
  await ref.putFile(localPath);
  return await ref.getDownloadURL();
};

const uploadAllFiles = async (files: MediaFile[], conversationId: string) => {
  return Promise.all(
    files.map((f) => uploadToFirebaseStorage(f.uri, conversationId))
  );
};

export const fetchAllUserConversations = async ({
  limit,
}: {
  limit: number;
}) => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getAllConversations'
    )({ limit });

    return data;
  } catch (error) {
    throw error;
  }
};
