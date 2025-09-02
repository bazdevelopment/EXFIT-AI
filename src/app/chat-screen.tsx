/* eslint-disable max-lines-per-function */
/* eslint-disable react-hooks/exhaustive-deps */

import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { type MessageType } from 'react-native-flash-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  useConversation,
  useConversationHistory,
} from '@/api/conversation/conversation.hooks';
import { useUser } from '@/api/user/user.hooks';
import AnimatedChatQuestions from '@/components/animted-chat-questions';
import AttachmentPreview from '@/components/attachment-preview';
import BounceLoader from '@/components/bounce-loader';
import Branding from '@/components/branding';
import ChatBubble from '@/components/chat-bubble';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import TypingIndicator from '@/components/typing-indicator';
import { colors, Image, Text } from '@/components/ui';
import { ArrowLeft, PaperPlane } from '@/components/ui/assets/icons';
import { LOADING_MESSAGES_CHATBOT } from '@/constants/loading-messages';
import { translate, useSelectedLanguage } from '@/core';
import useBackHandler from '@/core/hooks/use-back-handler';
import useKeyboard from '@/core/hooks/use-keyboard';
import { useTextToSpeech } from '@/core/hooks/use-text-to-speech';
import { checkIsVideo } from '@/core/utilities/check-is-video';
import { generateUniqueId } from '@/core/utilities/generate-unique-id';
import { shuffleArray } from '@/core/utilities/shuffle-array';
import { wait } from '@/core/utilities/wait';

const RANDOM_QUESTIONS = [
  'How do I track my fitness progress? 📈',
  'What should I eat to build muscle and gain weight? 🍗',
  'What are some effective at-home workouts? 🏠',
  'Is it okay to work out when I’m sore? 😩',
  'How can I improve my cardio endurance? 🏃‍♂️',
  'What’s the best way to build strength? 🏋️‍♀️',
  'How important is sleep for my fitness? 😴',
  'How do I find time to exercise with a busy schedule? ⏰',
  'What are some healthy snack ideas? 🍌',
  'How should I warm up properly before a workout? 🔥',
  'How do I stay consistent on days I have low energy? ⚡️',
  'How do I cut down on sugar in my diet? 🍩',
  'How much protein do I actually need each day? 🥚',
  'How can I eat to lose weight without feeling hungry? 🍽️',
  'How many days a week should I be working out? 🗓️',
];

const ChatScreen = () => {
  const {
    conversationId = generateUniqueId(),
    mediaSource,
    mimeType,
    conversationMode,
    question,
  } = useLocalSearchParams();
  const [randomQuestions, setRandomQuestions] = useState<string[]>([]);

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
  const { isKeyboardVisible } = useKeyboard();

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

  const { data: conversation, isLoading } = useConversationHistory(
    conversationId as string
  );
  const { sendMessage, isSending } = useConversation(conversationId as string);

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
      content: userMsg,
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
        userMessage: message.content,
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
      console.error('Error retrying message:', error);
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
    if (question) {
      handleSendMessage(question);
    }
  }, [question]);

  useEffect(() => {
    if (conversationMode === 'RANDOM_CONVERSATION') {
      setRandomQuestions(shuffleArray(RANDOM_QUESTIONS).slice(0, 5));
    }
  }, [conversationMode]);

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
      <KeyboardAwareScrollView
        contentContainerStyle={{
          //   paddingBottom: isKeyboardVisible && DEVICE_TYPE.ANDROID ? 100 : 0,
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
        // bottomOffset={500}
      >
        {/* <ScrollView
          contentContainerClassName="flex-1"
          keyboardShouldPersistTaps="handled"
        > */}
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Icon
            icon={<ArrowLeft color={colors.white} />}
            iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
            size={24}
            color={colors.white}
            onPress={() => {
              stopSpeaking();
              router.back();
            }}
          />

          <View className="ml-3 flex-row items-center">
            <View className="mr-3 items-center justify-center rounded-full">
              <Image
                source={require('../components/ui/assets/images/fit-character-training.jpg')}
                className="size-[40] rounded-full"
              />
            </View>
            <View>
              <Text className="font-medium-poppins text-lg text-white">
                Mojo, your AI Coach
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="size-2 rounded-full bg-success-400" />
                {isSending ? (
                  <Text className="text-xs text-white">
                    {translate('general.typing')}
                  </Text>
                ) : (
                  <Text className="font-medium-poppins text-xs text-white">
                    Online
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View className="flex-1 items-end justify-end">
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
        {conversationMode === 'RANDOM_CONVERSATION' &&
          !pendingMessages.length &&
          !conversation &&
          !!randomQuestions.length && (
            <ScrollView
              contentContainerClassName="h-[90%] justify-end"
              keyboardShouldPersistTaps="handled"
            >
              <AnimatedChatQuestions
                questions={randomQuestions}
                onSelect={(question) => handleSendMessage(question)}
              />
            </ScrollView>
          )}

        {/* Messages List */}
        <FlashList
          ref={flashListRef}
          data={messages}
          keyboardShouldPersistTaps="handled"
          extraData={isSpeaking}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 8,
          }}
          renderItem={({ item, index }) => (
            <ChatBubble
              message={item}
              isUser={item.role === 'user'}
              onRetrySendMessage={() => handleRetryMessage(item)}
              speak={(text) => handleSpeak(index.toString(), text)}
              isSpeaking={currentlySpeakingId === index.toString()}
              userGender={userInfo.onboarding.gender}
            />
          )}
          estimatedItemSize={100}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
        />

        {/* Input Area */}
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
            iconContainerStyle="rounded-2xl p-4 bg-[#4E52FB] z-[100]"
            color={colors.transparent}
            size={21}
          />
        </View>
        {/* </ScrollView> */}
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default ChatScreen;
