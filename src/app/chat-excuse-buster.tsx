/* eslint-disable max-lines-per-function */

import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, TextInput, View } from 'react-native';
import { type MessageType } from 'react-native-flash-message';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  useCreateActivityLog,
  useGetCalendarActivityLog,
} from '@/api/activity-logs/activity-logs.hooks';
import {
  useExcuseBusterConversation,
  useExcuseBusterConversationHistory,
} from '@/api/excuse-buster-conversation/excuse-buster-conversation.hooks';
import { useUser } from '@/api/user/user.hooks';
import AttachmentPreview from '@/components/attachment-preview';
import BounceLoader from '@/components/bounce-loader';
import Branding from '@/components/branding';
import ChatBubbleExcuseBuster from '@/components/chat-bubble-excuse-buster';
import { type IExcuseBusterMessage } from '@/components/chat-bubble-excuse-buster/chat-bubble-excuse-buster.interface';
import CustomAlert from '@/components/custom-alert';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import Toast from '@/components/toast';
import TypingIndicator from '@/components/typing-indicator';
import { colors, Image, Text } from '@/components/ui';
import { ArrowLeft, PaperPlane } from '@/components/ui/assets/icons';
import { MAX_DAILY_ACTIVITIES } from '@/constants/limits';
import { LOADING_MESSAGES_CHATBOT } from '@/constants/loading-messages';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import useBackHandler from '@/core/hooks/use-back-handler';
import { useTextToSpeech } from '@/core/hooks/use-text-to-speech';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
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
  const {
    currentYear,
    currentMonthNumber,
    startOfWeek,
    endOfWeek,
    currentDayNumber,
  } = useWeekNavigation();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const currentActiveDay = getCurrentDay('YYYY-MM-DD', language);
  const dayLabelTaskCard = getCurrentDay('MMM D', language);
  const { data: conversation, isLoading } = useExcuseBusterConversationHistory(
    conversationId as string
  );

  const { data: currentWeekActivityLogs } = useGetCalendarActivityLog({
    startDate: startOfWeek,
    endDate: endOfWeek,
    language,
  });

  const todayDateKey = `${currentYear}-${currentMonthNumber}-${currentDayNumber}`;

  const isActivitiesLimitReached =
    currentWeekActivityLogs?.[todayDateKey]?.length >= MAX_DAILY_ACTIVITIES;

  const { sendMessage, isSending } = useExcuseBusterConversation(
    conversationId as string
  );

  const { mutateAsync: onCreateActivityLog, isPending: isCreatingTaskPending } =
    useCreateActivityLog({ onSuccess: () => router.navigate('/(app)') });

  const onCreateTasks = (params) => {
    if (isActivitiesLimitReached) {
      return Toast.showCustomToast(
        <CustomAlert
          title={translate('general.attention')}
          subtitle={translate('components.DailyCheckInForm.activitiesLimit', {
            MAX_DAILY_ACTIVITIES,
          })}
          buttons={[
            {
              label: translate('general.ok'),
              variant: 'default',
              onPress: Toast.dismiss,
              buttonTextClassName: 'dark:text-white',
              className:
                'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
            },
          ]}
        />,
        {
          duration: 10000000,
        }
      );
    }
    onCreateActivityLog(params);
  };
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
    const newMessage: IExcuseBusterMessage = {
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
  }, [messages.length, lastUserMessageIndex]);

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
      <KeyboardAvoidingView
        behavior={DEVICE_TYPE.IOS ? 'padding' : 'padding'}
        className="flex-1"
        keyboardVerticalOffset={DEVICE_TYPE.IOS ? 0 : 20}
      >
        <View className="-mt-4 flex-1">
          {/* Header */}

          <View className="flex-row items-center px-4 py-3">
            <Icon
              icon={<ArrowLeft />}
              iconContainerStyle="items-center p-2.5 justify-center rounded-full border-2 border-charcoal-800"
              size={24}
              color={colors.white}
              onPress={router.back}
            />
            <View className="ml-3 flex-row items-center">
              <View className="mr-3 items-center justify-center rounded-full">
                <Image
                  source={require('../components/ui/assets/images/excuse-buster-robot.jpg')}
                  className="size-[40] rounded-full"
                />
              </View>
              <View>
                <Text className="font-medium-poppins text-lg text-white">
                  {translate('rootLayout.screens.excuseBuster.heading')}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="size-2 rounded-full bg-success-400" />
                  {isSending ? (
                    <Text className="text-xs text-white">
                      {translate('general.typing')}
                    </Text>
                  ) : (
                    <Text className="font-medium-poppins text-xs text-white">
                      {translate('general.online')}
                    </Text>
                  )}
                </View>
              </View>
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
            extraData={isSpeaking || isCreatingTaskPending}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              paddingHorizontal: 10,
              // paddingBottom: isKeyboardVisible && DEVICE_TYPE.ANDROID ? 250 : 0,
            }}
            renderItem={({ item, index }) => (
              <ChatBubbleExcuseBuster
                message={item}
                isUser={item.role === 'user'}
                onRetrySendMessage={() => handleRetryMessage(item)}
                speak={(text) => handleSpeak(index.toString(), text)}
                isSpeaking={currentlySpeakingId === index.toString()}
                onSendMessage={handleSendMessage}
                onCreateTask={onCreateTasks}
                currentActiveDay={currentActiveDay}
                isCreatingTaskPending={isCreatingTaskPending}
                dayLabelTaskCard={dayLabelTaskCard}
                userGender={userInfo.onboarding.gender}
              />
            )}
            estimatedItemSize={100}
            ListFooterComponent={isSending ? <TypingIndicator /> : null}
          />

          {/* Input Area */}
          {/* <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} // Adjust if you have a tab bar
        > */}
          <View className="w-full flex-row items-center justify-between gap-3 bg-black px-3 pb-2 pt-4 dark:border-blackEerie dark:bg-black">
            <View className="flex-1 rounded-2xl border border-white/20 bg-[#191A21] px-4 py-1">
              <TextInput
                className="ml-0 pb-3 pt-2 text-base text-white"
                value={userMessage}
                onChangeText={setUserMessage}
                placeholder={translate('general.chatbotPlaceholder')}
                placeholderTextColor={colors.charcoal[300]}
                keyboardAppearance="dark"
                multiline
                maxLength={700}
              />
            </View>
            <Icon
              onPress={() => handleSendMessage(userMessage)}
              icon={<PaperPlane />}
              iconContainerStyle="rounded-2xl p-4 bg-[#4E52FB]"
              color={colors.transparent}
              size={21}
            />
          </View>
          {/* </KeyboardAvoidingView> */}
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ChatExcuseBuster;
