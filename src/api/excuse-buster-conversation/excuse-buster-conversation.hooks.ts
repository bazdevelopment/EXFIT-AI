import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';

import { queryClient } from '../common';
import {
  fetchExcuseBusterConversation,
  getAllUserExcuseBusterConversations,
  sendExcuseBusterConversationMessage,
} from './excuse-buster-conversation.requests';

export const useExcuseBusterConversationHistory = (conversationId: string) => {
  return createQuery({
    queryKey: ['conversation-excuse-buster', conversationId],
    fetcher: () => fetchExcuseBusterConversation({ conversationId }),
    // enabled: false,
    // initialData: { messages: [] }, // Default initial data
  })();
};

export const useExcuseBusterConversation = (conversationId: string) => {
  // Mutation to send a new message
  const sendMessageMutation = createMutation({
    mutationFn: (variables) => sendExcuseBusterConversationMessage(variables),
    onSuccess: () => {
      // Invalidate the conversation query to refetch the latest messages
      queryClient.invalidateQueries({
        queryKey: ['conversation-excuse-buster', conversationId],
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

export const useGetAllExcuseBusterConversations = ({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}) => {
  return createQuery({
    queryKey: ['allConversationsExcuseBuster', userId],
    fetcher: () => getAllUserExcuseBusterConversations({ userId, limit }),
  })();
};
