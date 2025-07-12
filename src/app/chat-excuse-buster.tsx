/* eslint-disable max-lines-per-function */

import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  View,
} from 'react-native';
import { type MessageType } from 'react-native-flash-message';
import { Toaster } from 'sonner-native';

import { useCreateAiTask } from '@/api/ai-tasks/ai-tasks.hooks';
import {
  useExcuseBusterConversation,
  useExcuseBusterConversationHistory,
} from '@/api/excuse-buster-conversation/excuse-buster-conversation.hooks';
import { useUser } from '@/api/user/user.hooks';
import AttachmentPreview from '@/components/attachment-preview';
import BounceLoader from '@/components/bounce-loader';
import Branding from '@/components/branding';
import ChatBubbleExcuseBuster from '@/components/chat-bubble-excuse-buster';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import TypingIndicator from '@/components/typing-indicator';
import { colors, Text } from '@/components/ui';
import { ArrowLeft, SendIcon } from '@/components/ui/assets/icons';
import { LOADING_MESSAGES_CHATBOT } from '@/constants/loading-messages';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import useBackHandler from '@/core/hooks/use-back-handler';
import { useTextToSpeech } from '@/core/hooks/use-text-to-speech';
import { checkIsVideo } from '@/core/utilities/check-is-video';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';
import { generateUniqueId } from '@/core/utilities/generate-unique-id';
import { wait } from '@/core/utilities/wait';

const ChatExcuseBuster = () => {
  const {
    conversationId = generateUniqueId(),
    mediaSource,
    mimeType,
    conversationMode,
    excuse,
  } = useLocalSearchParams();
  console.log({
    mediaSource,
    mimeType,
    conversationMode,
    excuse,
    conversationId,
  });
  const [userMessage, setUserMessage] = useState('');
  const [pendingMessages, setPendingMessages] = useState<MessageType[]>([]);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(
    null
  );
  const [lastUserMessageIndex, setLastUserMessageIndex] = useState<
    number | null
  >(null);
  const isVideo = checkIsVideo(mimeType as string);

  const flashListRef = useRef<FlashList<MessageType>>(null);

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
  } = useTextToSpeech({
    preferredGender: 'female',
  });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const currentActiveDay = getCurrentDay('YYYY-MM-DD', language);
  const dayLabelTaskCard = getCurrentDay('MMM D', language);

  const { data: conversation, isLoading } = useExcuseBusterConversationHistory(
    conversationId as string
  );

  const { sendMessage, isSending } = useExcuseBusterConversation(
    conversationId as string
  );

  const { mutate: onCreateTask } = useCreateAiTask(currentActiveDay);

  const handleSpeak = (messageId: string, text: string) => {
    if (currentlySpeakingId === messageId) {
      setCurrentlySpeakingId(null);
      speak(text);
      wait(50).then(() => stopSpeaking()); //hack to be able to stop the speech when navigating throught different messages
    } else {
      setCurrentlySpeakingId(messageId);
      stopSpeaking();
      speak(text);
    }
  };

  const handleSendMessage = async (userMsg: string) => {
    if (!userMsg.trim()) return;
    setUserMessage('');
    Keyboard.dismiss();

    // Add the message to pending messages
    const newMessage: MessageType = {
      role: 'user',
      content: { responseText: userMsg },
      isPending: true,
    };
    setPendingMessages((prev) => [...prev, newMessage]);

    // Store the index of the user's message
    setLastUserMessageIndex(messages.length);

    try {
      await sendMessage({
        userMessage: userMsg,
        conversationId: conversationId as string,
        conversationMode,
        userId: userInfo.userId,
        language,
      });
      // Remove the pending message and add it to the conversation
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.content !== newMessage.content)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark the message as failed
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.content === newMessage.content
            ? { ...msg, isPending: false, isError: true }
            : msg
        )
      );
    }
  };

  const handleRetryMessage = async (message: MessageType) => {
    try {
      // Mark the message as pending again
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.content === message.content
            ? { ...msg, isPending: true, isError: false }
            : msg
        )
      );

      await sendMessage({
        userMessage: `${message.content.responseText}`,
        conversationId: conversationId as string,
        conversationMode,
        userId: userInfo.userId,
        language,
      });

      // Remove the pending message and add it to the conversation
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.content !== message.content)
      );
    } catch (error) {
      console.error('Error retrying message:', error.message);
      // Mark the message as failed again
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.content === message.content
            ? { ...msg, isPending: false, isError: true }
            : msg
        )
      );
    }
  };

  // Combine conversation messages and pending messages
  interface ConversationMessage {
    role: string;
    content: string;
  }
  const messages: MessageType[] = useMemo(
    () => [
      ...(conversation?.messages?.filter(
        (msg: ConversationMessage) => !Array.isArray(msg.content)
      ) || []),
      ...pendingMessages,
    ],
    [conversation?.messages, pendingMessages]
  );

  useBackHandler(() => true);

  useEffect(() => {
    if (excuse) {
      handleSendMessage(excuse);
      // sendMessageExcuse();
    }
  }, [excuse]);

  // Scroll logic based on the number of messages
  useEffect(() => {
    if (messages.length && flashListRef.current) {
      setTimeout(() => {
        if (lastUserMessageIndex !== null) {
          // Scroll to the user's question
          flashListRef.current?.scrollToIndex({
            index: lastUserMessageIndex,
            animated: true,
            viewPosition: 0, // Align the top of the item with the top of the list
          });
        } else {
          // If there's only one message, scroll to the top
          flashListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
        }
      }, 100);
    }
  }, [lastUserMessageIndex]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        flashListRef.current?.scrollToOffset({
          offset: 100000,
          animated: true,
        });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  if (isLoading && conversationMode !== 'RANDOM_CONVERSATION') {
    return (
      <View className="flex-1 items-center justify-center bg-black dark:bg-blackEerie">
        <Branding imageClassname="" isLogoVisible invertedColors />
        <ActivityIndicator
          size="large"
          className="my-6 items-center justify-center"
          color={isDark ? colors.charcoal[300] : colors.charcoal[100]}
        />
        <BounceLoader
          loadingMessages={LOADING_MESSAGES_CHATBOT}
          textClassName="text-black dark:text-white"
        />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      {DEVICE_TYPE.IOS && (
        <Toaster autoWiggleOnUpdate="toast-change" pauseWhenPageIsHidden />
      )}
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={DEVICE_TYPE.ANDROID ? 40 : 0}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <Icon
              size={24}
              containerStyle="rounded-2xl bg-charcoal-800 p-3"
              onPress={() => {
                stopSpeaking();
                router.back();
              }}
              icon={<ArrowLeft color={colors.white} />}
            />

            <View className="item-center mr-6 justify-center">
              <Text className="ml-2 font-bold-poppins text-2xl text-white">
                Aria
              </Text>
              {isSending ? (
                <Text className="ml-2 text-xs text-white">
                  {translate('general.typing')}
                </Text>
              ) : (
                <View className="flex-row items-center gap-2">
                  <View className="size-2 rounded-full bg-success-400" />
                  <Text className="text-xs text-white">
                    {translate('general.online')}
                  </Text>
                </View>
              )}
            </View>
            <View>
              {!!mediaSource && (
                <AttachmentPreview
                  filePath={mediaSource as string}
                  isVideo={isVideo}
                  className="size-[40px] rounded-xl border-0"
                  isEntirelyClickable
                />
              )}
            </View>
          </View>

          {/* Messages List */}
          <FlashList
            ref={flashListRef}
            data={messages}
            extraData={isSpeaking}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 8,
            }}
            renderItem={({ item, index }) => (
              <ChatBubbleExcuseBuster
                message={item}
                isUser={item.role === 'user'}
                onRetrySendMessage={() => handleRetryMessage(item)}
                speak={(text) => handleSpeak(index.toString(), text)}
                isSpeaking={currentlySpeakingId === index.toString()}
                onSendMessage={handleSendMessage}
                onCreateTask={onCreateTask}
                dayLabelTaskCard={dayLabelTaskCard}
              />
            )}
            estimatedItemSize={100}
            ListFooterComponent={isSending ? <TypingIndicator /> : null}
          />

          {/* Input Area */}
          <View className="w-full flex-row items-center justify-between gap-4 bg-black px-4 pb-2 pt-4 dark:border-blackEerie dark:bg-blackEerie">
            <View className="w-[85%] rounded-full border border-white bg-black px-4 py-1">
              <TextInput
                className="ml-4 pb-4 pt-3 text-base text-white"
                value={userMessage}
                onChangeText={setUserMessage}
                placeholder={translate('general.chatbotPlaceholder')}
                placeholderTextColor={colors.white}
                keyboardAppearance="dark"
                multiline
                maxLength={150}
              />
            </View>
            <Icon
              onPress={() => handleSendMessage(userMessage)}
              icon={<SendIcon />}
              iconContainerStyle="rounded-full p-4 bg-[#3195FD]"
              color={colors.transparent}
              size={21}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ChatExcuseBuster;
