/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Toaster } from 'sonner-native';
import { twMerge } from 'tailwind-merge';

import { useUser } from '@/api/user/user.hooks';
import AttachmentPreview from '@/components/attachment-preview';
import BounceLoader from '@/components/bounce-loader';
import Branding from '@/components/branding';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import Toast from '@/components/toast';
import { colors, Text } from '@/components/ui';
import {
  BackRoundedIcon,
  SendIcon,
  SoundOn,
  StopIcon,
} from '@/components/ui/assets/icons';
import CopyIcon from '@/components/ui/assets/icons/copy';
import { LOADING_MESSAGES_CHATBOT } from '@/constants/loading-messages';
import { DEVICE_TYPE, translate } from '@/core';
import useBackHandler from '@/core/hooks/use-back-handler';
import { useTextToSpeech } from '@/core/hooks/use-text-to-speech';
import { checkIsVideo } from '@/core/utilities/check-is-video';
import { generateUniqueId } from '@/core/utilities/generate-unique-id';
import { wait } from '@/core/utilities/wait';

type MessageType = {
  role: string;
  content: string;
  isPending?: boolean;
  isError?: boolean;
};

export const ChatBubble = ({
  message,
  isUser,
  onRetrySendMessage,
  speak,
  isSpeaking,
}: {
  message: MessageType;
  isUser: boolean;
  onRetrySendMessage: () => void;
  speak: (text: string) => void;
  isSpeaking: boolean;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const { lightStyles, darkStyles } = getChatMessagesStyles(
    message,
    isUser,
    colors
  );

  return (
    <>
      {/* Main Message Container */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
        className={twMerge(
          'mb-1 flex-row items-end',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        {/* Assistant Avatar */}
        {!isUser && (
          <View className="mb-1 mr-3 size-10 items-center justify-center rounded-full bg-charcoal-800">
            <Image
              source={require('../components/ui/assets/images/assistant-avatar.png')}
              className="size-8 rounded-full"
            />
          </View>
        )}

        {/* Message Bubble */}
        <View
          className={twMerge(
            'px-4 py-3 rounded-2xl max-w-[90%]',
            isUser
              ? 'bg-[#3195FD] rounded-br-sm ml-12 w-[85%]'
              : message.isError
                ? 'bg-red-500 rounded-tl-sm'
                : 'bg-[#202020] rounded-bl-sm'
          )}
        >
          <Markdown style={lightStyles}>{message.content}</Markdown>
          {!isUser && (
            <View className="mt-2 flex-row gap-2">
              {/* Thumbs Down */}
              <TouchableOpacity className="rounded-full p-1">
                <CopyIcon width={18} height={18} color={colors.white} />
              </TouchableOpacity>

              {/* Text to Speech */}
              {!!speak && (
                <TouchableOpacity
                  onPress={() => speak(message.content)}
                  className="rounded-full p-1"
                >
                  {isSpeaking ? (
                    <StopIcon width={16} height={16} color={colors.white} />
                  ) : (
                    <SoundOn width={16} height={16} color={colors.white} />
                  )}
                </TouchableOpacity>
              )}

              {/* Speaking Animation */}
              {isSpeaking && (
                <View className="ml-[-12px]">
                  <LottieView
                    source={require('assets/lottie/speaking-animation.json')}
                    autoPlay
                    loop
                    style={{ width: 60, height: 20 }}
                  />
                </View>
              )}
            </View>
          )}
          {message.isPending && !isUser && <TypingIndicator />}
        </View>

        {/* User Avatar */}
        {isUser && (
          <View className="mb-1 ml-3 size-10 items-center justify-center rounded-full bg-charcoal-800">
            <Image
              source={require('../components/ui/assets/images/avatar.png')}
              className="size-8 rounded-full"
            />
          </View>
        )}
      </Animated.View>

      {/* Action Buttons Row */}
      <View
        className={twMerge(
          'flex-row items-center gap-2 mb-3',
          isUser ? 'justify-end pr-13' : 'justify-start pl-13'
        )}
      >
        {/* Error Retry Button */}
        {message.isError && (
          <TouchableOpacity
            className="ml-2 flex-row items-center gap-1"
            onPress={onRetrySendMessage}
          >
            <Text className="text-xs text-red-400">
              {translate('general.tryAgain')}
            </Text>
            <Ionicons name="refresh-circle" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export const TypingIndicator = () => {
  return (
    <LottieView
      source={require('assets/lottie/typing-loader-animation.json')}
      autoPlay
      loop
      style={{ width: 80, height: 80, marginLeft: -15, top: -25 }}
    />
  );
};

const ChatScreen = () => {
  const {
    conversationId = generateUniqueId(),
    mediaSource,
    mimeType,
    conversationMode,
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

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    i18n: { language },
  } = useTranslation();
  const { data: userInfo } = useUser(language);

  // const { data: conversation, isLoading } = useConversationHistory(
  //   conversationId as string
  // );
  // const { sendMessage, isSending } = useConversation(conversationId as string);

  const conversation = {
    messages: [
      {
        role: 'assistant',
        content:
          "Hello! I'm Aria, your AI assistant. How can I help you today?",
      },
      {
        role: 'user',
        content: 'Can you explain what machine learning is?',
      },
      {
        role: 'assistant',
        content:
          "**Machine Learning** is a subset of artificial intelligence (AI) that enables computers to learn and make decisions from data without being explicitly programmed for every task.\n\nHere are the key concepts:\n\n• **Supervised Learning**: Learning from labeled examples\n• **Unsupervised Learning**: Finding patterns in unlabeled data\n• **Reinforcement Learning**: Learning through trial and error\n\nIt's like teaching a computer to recognize patterns, just like how humans learn from experience!",
      },
      {
        role: 'user',
        content: "That's helpful! Can you give me a simple example?",
      },
      {
        role: 'assistant',
        content:
          'Sure! Here\'s a simple example:\n\nImagine you want to predict if an email is **spam** or **not spam**:\n\n1. **Training**: You show the computer thousands of emails labeled as "spam" or "not spam"\n2. **Pattern Recognition**: The computer learns that certain words like "FREE", "URGENT", or excessive exclamation marks often appear in spam\n3. **Prediction**: When a new email arrives, the computer analyzes these patterns and predicts whether it\'s spam\n\nIt\'s essentially pattern matching at scale! *Pretty cool, right?*',
      },
    ],
  };
  const isLoading = false;
  const sendMessage = () => {};
  const isSending = false;

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

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    setUserMessage('');
    Keyboard.dismiss();

    // Add the message to pending messages
    const newMessage: MessageType = {
      role: 'user',
      content: userMessage,
      isPending: true,
    };
    setPendingMessages((prev) => [...prev, newMessage]);

    // Store the index of the user's message
    setLastUserMessageIndex(messages.length);

    try {
      await sendMessage({
        userMessage,
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
  }, []);

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

  useEffect(() => {
    if (!isLoading && conversationMode === 'IMAGE_SCAN_CONVERSATION') {
      Toast.warning(translate('alerts.medicalDisclaimerAlert'), {
        closeButton: true,
        duration: 8000,
      });
    }
  }, [isLoading, conversationMode]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black dark:bg-blackEerie">
        <Branding isLogoVisible invertedColors />
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
              icon={<BackRoundedIcon color={colors.white} />}
            />
            <View className="item-center mr-6 justify-center">
              <Text className="ml-2 font-bold-nunito text-2xl text-white">
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
              <ChatBubble
                message={item}
                isUser={item.role === 'user'}
                onRetrySendMessage={() => handleRetryMessage(item)}
                speak={(text) => handleSpeak(index.toString(), text)}
                isSpeaking={currentlySpeakingId === index.toString()}
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
                multiline
                maxLength={150}
              />
            </View>
            <Icon
              onPress={handleSendMessage}
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

export default ChatScreen;

type Message = {
  isError: boolean;
};

type Colors = {
  danger: Record<number, string>;
  white: string;
  charcoal: Record<number, string>;
};

type StyleObject = Record<string, React.CSSProperties>;

function getChatMessagesStyles(
  message: Message,
  isUser: boolean,
  colors: Colors
): {
  lightStyles: StyleObject;
  darkStyles: StyleObject;
} {
  const baseTextColor = message.isError ? colors.danger[800] : colors.white;

  const darkTextColor = message.isError ? colors.danger[800] : colors.white;

  const lightStyles: StyleObject = {
    body: {
      marginTop: -7,
      marginBottom: -7,
      fontSize: 14,
      lineHeight: 22,
      color: baseTextColor,
    },
    heading1: {
      color: baseTextColor,
    },
    paragraph: {
      fontFamily: 'Font-Regular',
    },
    list_item: {
      fontFamily: 'Font-Regular',
    },
    span: {
      fontFamily: 'Font-Regular',
    },
    strong: {
      fontFamily: 'Font-Extra-Bold',
      fontWeight: '800',
    },
    em: {
      fontFamily: 'Font-Regular',
      fontStyle: 'italic',
    },
  };

  const darkStyles: StyleObject = {
    body: {
      marginTop: -7,
      marginBottom: -7,
      fontSize: 14,
      lineHeight: 22,
      color: darkTextColor,
    },
    heading1: {
      fontFamily: 'Font-Extra-Bold',
      color: darkTextColor,
    },
    heading2: {
      fontFamily: 'Font-Extra-Bold',
      fontWeight: '800',
    },
    paragraph: {
      fontFamily: 'Font-Regular',
    },
    list_item: {
      fontFamily: 'Font-Regular',
    },
    span: {
      fontFamily: 'Font-Regular',
    },
    strong: {
      fontFamily: 'Font-Extra-Bold',
      fontWeight: '800',
    },
    em: {
      fontFamily: 'Font-Regular',
      fontStyle: 'italic',
    },
  };

  return { lightStyles, darkStyles };
}
