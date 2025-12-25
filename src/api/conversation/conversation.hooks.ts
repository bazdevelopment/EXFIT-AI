import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';

import { queryClient } from '../common';
import {
  analyzeMultipleFilesUsingAI,
  fetchAllUserConversations,
  fetchConversation,
  getAllUserConversations,
  sendConversationMessage,
} from './conversation.requests';

export const useConversationHistory = (conversationId: string) => {
  return createQuery({
    queryKey: ['conversation', conversationId],
    fetcher: () => fetchConversation({ conversationId }),
    // enabled: false,
    // initialData: { messages: [] }, // Default initial data
  })();
};
export const useAllUserConversations = (limit: number = 10) => {
  return createQuery({
    queryKey: ['user-conversations'],
    fetcher: () => fetchAllUserConversations({ limit }),
  })();
};

export const useGetAllUserConversations = ({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}) => {
  return createQuery({
    queryKey: ['allConversations', userId],
    fetcher: () => getAllUserConversations({ userId, limit }),
  })();
};

export const useConversation = (conversationId: string) => {
  // Mutation to send a new message
  const sendMessageMutation = createMutation({
    mutationFn: (variables) => sendConversationMessage(variables),
    onSuccess: () => {
      // Invalidate the conversation query to refetch the latest messages
      queryClient.invalidateQueries({
        queryKey: ['conversation', conversationId],
      });
    },
    onError: (error) => {
      Toast.error(error.response.data.message);
    },
  })();

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
};

// -------------------------------
// Main hook for chat messages

interface MediaFile {
  uri: string;
  type: string;
  mimeType?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrls?: string[];
  files?: MediaFile[];
}
interface SendMessageParams {
  prompt: string;
  userMessage: string;
  conversationId: string;
  userId: string;
  history: Message[];
  mediaFiles?: MediaFile[];
  language?: string;
}

interface StreamingMessageParams extends SendMessageParams {
  onStream?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

export const useSendStreamingMessage = ({ onComplete, onError }) => {
  return createMutation({
    mutationKey: ['send-streaming-message'],
    mutationFn: async (params: StreamingMessageParams): Promise<any> => {
      return analyzeMultipleFilesUsingAI(params);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', data.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['user-conversations'] });
      onComplete?.(data);
    },
    onError: (error) => {
      onError?.();

      console.error('Failed to send message:', error);
    },
  })();
};
