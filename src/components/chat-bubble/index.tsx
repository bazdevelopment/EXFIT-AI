/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { twMerge } from 'tailwind-merge';

import { SoundOn, StopIcon } from '@/components/ui/assets/icons';
import CopyIcon from '@/components/ui/assets/icons/copy';
import { DEVICE_TYPE, translate } from '@/core';
import { useClipboard } from '@/core/hooks/use-clipboard';
import { extractStructuredMacro } from '@/core/utilities/extract-structured-macro';
import { getChatMessagesStyles } from '@/core/utilities/get-chat-messages.styles';

import { MessageContainer } from '../chat-bubble-excuse-buster';
import { MacroOverview } from '../macro-overview';
import MessageMediaAttachments from '../message-media-attachments';
import TypingIndicator from '../typing-indicator';
import { colors, Image, Text } from '../ui';
import { LockerIcon } from '../ui/assets/icons/locker';

type MessageType = {
  role: string;
  content: string;
  isPending?: boolean;
  isError?: boolean;
};

const avatars = {
  male: require('../../components/ui/assets/images/avatar-male.png'),
  female: require('../../components/ui/assets/images/avatar-female.png'),
  default: require('../../components/ui/assets/images/avatar-male.png'),
};

const BlurredMessageOverlay = ({
  onUnlock,
  isDark,
}: {
  onUnlock: () => void;
  isDark: boolean;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      className="absolute inset-0 top-[30%] items-center justify-center rounded-2xl"
      onPress={onUnlock}
      activeOpacity={1}
    >
      {DEVICE_TYPE.IOS ? (
        <BlurView
          blurAmount={2}
          blurType={isDark ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill]}
        />
      ) : (
        <View className="absolute inset-0 bg-slate-100/95 dark:bg-blackBeauty/95" />
      )}
      <TouchableOpacity
        onPress={onUnlock}
        className="items-center justify-center"
        activeOpacity={0.7}
      >
        <View className="rounded-full border-2 border-charcoal-300 p-[3px] dark:border-charcoal-500 dark:bg-charcoal-800">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="border-1 items-center justify-center rounded-full border-charcoal-700 bg-[#2196F3] p-4 shadow-lg"
          >
            <LockerIcon width={22} height={22} fill={colors.white} />
          </Animated.View>
        </View>

        <Text className="font-bold-nunito mt-2 rounded-full bg-white p-2 text-center text-base text-gray-800 dark:bg-blackEerie dark:text-white">
          {translate('general.unlockNow')} 🔓
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const ChatBubble = ({
  message,
  isUser,
  onRetrySendMessage,
  speak,
  isSpeaking,
  userGender,
  shouldBlur = false,
  onUnlock,
}: {
  message: MessageType;
  isUser: boolean;
  onRetrySendMessage: () => void;
  speak: (text: string) => void;
  isSpeaking: boolean;
  userGender: string;
  shouldBlur?: boolean;
  onUnlock?: () => void;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { copyToClipboard, copiedText } = useClipboard();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const { lightStyles } = getChatMessagesStyles(message, isUser, colors);
  const { extractedData: metadata, chatText } = extractStructuredMacro(
    message.content
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
              source={require('../ui/assets/images/fit-character-training.jpg')}
              className="size-8 rounded-full"
            />
          </View>
        )}

        {/* Message Bubble */}
        <MessageContainer isUser={isUser} message={message}>
          {!!metadata?.data && <MacroOverview metadata={metadata} />}
          <Markdown style={lightStyles}>{`${chatText}`}</Markdown>

          {/* </Text> */}
          {!isUser && (
            <View className="mt-2 flex-row gap-2">
              {/* Thumbs Down */}
              <TouchableOpacity
                className="rounded-full p-1"
                onPress={() => copyToClipboard(chatText)}
              >
                <CopyIcon width={18} height={18} color={colors.white} />
              </TouchableOpacity>

              {/* Text to Speech */}
              {!!speak && (
                <TouchableOpacity
                  onPress={() => speak(chatText)}
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
        </MessageContainer>

        {/* User Avatar */}
        {isUser && (
          <View className="ml-2 size-8 items-center justify-center rounded-full bg-charcoal-800">
            <Image source={avatars['male']} className="size-8 rounded-full" />
          </View>
        )}
        {/* Blur Overlay - only visible for specific message */}
        {shouldBlur && !isUser && onUnlock && (
          <BlurredMessageOverlay onUnlock={onUnlock} isDark={isDark} />
        )}
      </Animated.View>
      {isUser && message?.imageUrls?.length > 0 && (
        <MessageMediaAttachments
          urls={message.imageUrls}
          isUser={isUser}
          onDocumentPress={(url) => {
            // Optional: Custom handler for document press
            // e.g., open in a WebView, download, etc.
            // Linking.openURL(url);
          }}
        />
      )}

      {message.isError && (
        <TouchableOpacity
          className="ml-2 flex-1 flex-row justify-end  gap-1"
          onPress={onRetrySendMessage}
        >
          <Text className="mt-1 text-xs text-red-500">
            {translate('general.tryAgain')}
          </Text>
          <Ionicons name="refresh-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      )}
    </>
  );
};

export default ChatBubble;
