import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { twMerge } from 'tailwind-merge';

import { SoundOn, StopIcon } from '@/components/ui/assets/icons';
import CopyIcon from '@/components/ui/assets/icons/copy';
import { translate } from '@/core';
import { useClipboard } from '@/core/hooks/use-clipboard';
import { getChatMessagesStyles } from '@/core/utilities/get-chat-messages.styles';

import { MessageContainer } from '../chat-bubble-excuse-buster';
import TypingIndicator from '../typing-indicator';
import { colors, Image, Text } from '../ui';

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

export const ChatBubble = ({
  message,
  isUser,
  onRetrySendMessage,
  speak,
  isSpeaking,
  userGender,
}: {
  message: MessageType;
  isUser: boolean;
  onRetrySendMessage: () => void;
  speak: (text: string) => void;
  isSpeaking: boolean;
  userGender: string;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { copyToClipboard } = useClipboard();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const { lightStyles } = getChatMessagesStyles(message, isUser, colors);

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
          <Markdown style={lightStyles}>{`${message.content}`}</Markdown>

          {/* </Text> */}
          {!isUser && (
            <View className="mt-2 flex-row gap-2">
              {/* Thumbs Down */}
              <TouchableOpacity
                className="rounded-full p-1"
                onPress={() => copyToClipboard(message.content)}
              >
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
        </MessageContainer>

        {/* User Avatar */}
        {isUser && (
          <View className="ml-2 size-8 items-center justify-center rounded-full bg-charcoal-800">
            <Image
              source={avatars[userGender]}
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

export default ChatBubble;
