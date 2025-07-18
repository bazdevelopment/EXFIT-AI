/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getCalendars } from 'expo-localization';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { twMerge } from 'tailwind-merge';

import { type ICreateLogRequestData } from '@/api/activity-logs/activity-logs.types';
import { SoundOn, StopIcon } from '@/components/ui/assets/icons';
import CopyIcon from '@/components/ui/assets/icons/copy';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import { useClipboard } from '@/core/hooks/use-clipboard';
import { getChatMessagesStyles } from '@/core/utilities/get-chat-messages.styles';

import TaskCard from '../task-card';
import { Button, colors, Image, Text } from '../ui';
import { type IExcuseBusterMessage } from './chat-bubble-excuse-buster.interface';

const avatars = {
  male: require('../../components/ui/assets/images/avatar-male.png'),
  female: require('../../components/ui/assets/images/avatar-female.png'),
  default: require('../../components/ui/assets/images/avatar-male.png'),
};

export const ChatBubbleExcuseBuster = ({
  message,
  isUser,
  onRetrySendMessage,
  speak,
  isSpeaking,
  onSendMessage,
  currentActiveDay,
  isCreatingTaskPending,
  onCreateTask,
  dayLabelTaskCard,
  userGender,
}: {
  message: IExcuseBusterMessage;
  isUser: boolean;
  onRetrySendMessage: () => void;
  speak: (text: string) => void;
  isSpeaking: boolean;
  onSendMessage: (message: string) => void;
  onCreateTask: (payload: ICreateLogRequestData) => void;
  isCreatingTaskPending: boolean;
  dayLabelTaskCard: string;
  userGender: string;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { copyToClipboard } = useClipboard();
  const [{ timeZone }] = getCalendars();

  const { language } = useSelectedLanguage();

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
              source={require('../ui/assets/images/excuse-buster-robot.jpg')}
              className="size-8 rounded-full"
            />
          </View>
        )}

        {/* Message Bubble */}
        <MessageContainer isUser={isUser} message={message}>
          <Markdown style={lightStyles}>
            {`${message.content.responseText}`}
          </Markdown>

          {message.content.challenge && (
            <View className="mt-2">
              <Text className="font-bold-poppins">
                How about pushing yourself a little with this challenge?
              </Text>
              <Text className="font-bold-poppins">
                {message.content.challenge.title}
              </Text>
              <Markdown style={lightStyles}>
                {message.content.challenge.description}
              </Markdown>
            </View>
          )}

          {message.content.challenge && (
            <TaskCard
              className="mt-4"
              activityName={message.content.challenge.title}
              gemsEarned={message.content.challenge.rewards.gems}
              xpEarned={message.content.challenge.rewards.xp}
              durationMinutes={message.content.challenge.durationMinutes}
              description={message.content.challenge.description}
              isCreatingTaskPending={isCreatingTaskPending}
              onCreateTask={() =>
                onCreateTask({
                  language,
                  timezone: timeZone as string,
                  date: currentActiveDay,
                  type: 'custom_ai_task',
                  durationMinutes: message?.content?.challenge?.durationMinutes,
                  activityName: message?.content?.challenge?.title,
                  gemsReward: message?.content?.challenge?.rewards.gems,
                  xpReward: message?.content?.challenge?.rewards.xp,
                  description: message?.content?.challenge?.description,
                  status: 'active',
                })
              }
            />
          )}

          {!isUser && (
            <View className="mt-3 flex-row items-center gap-3">
              {/* Copy Button */}
              <TouchableOpacity
                className="rounded-full bg-white/10 p-2"
                onPress={() => copyToClipboard(message.content.responseText)}
                activeOpacity={0.7}
              >
                <CopyIcon width={16} height={16} color={colors.white} />
              </TouchableOpacity>

              {/* Text to Speech Button */}
              {!!speak && (
                <TouchableOpacity
                  onPress={() => speak(message.content.responseText)}
                  className="rounded-full bg-white/10 p-2"
                  activeOpacity={0.7}
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
                <View className="ml-1">
                  <LottieView
                    source={require('assets/lottie/speaking-animation.json')}
                    autoPlay
                    loop
                    style={{ width: 56, height: 20 }}
                  />
                </View>
              )}
            </View>
          )}
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

        {!!message.content.buttons && (
          <View>
            {message.content.buttons.map((button) => (
              <Button
                key={button.id}
                variant="default"
                label={`${button.text} ${button.isTextInputPrompt ? '(Type your input below)' : ''}`}
                disabled={button.isTextInputPrompt}
                // isTextInputPrompt={button.isTextInputPrompt}
                textClassName={`font-medium-poppins ${button.isTextInputPrompt ? 'text-white dark:text-white text-sm' : ''} text-center`}
                onPress={() => onSendMessage(button.text)}
                className={`${button.isTextInputPrompt ? '-mt-2 flex h-auto min-h-12' : ''} rounded-lg disabled:bg-black`}
              />
            ))}
          </View>
        )}
      </View>
      {/* {!!message.content.isFinalStep && !!message.content.task && (
        <ActivityTaskCard
          task={message.content.task}
          onCreateTask={onCreateTask}
          containerClassName="mb-4"
          dayLabelTaskCard={dayLabelTaskCard}
        />
      )} */}
    </>
  );
};

const getBubbleStyle = ({ isUser, message }) => {
  if (isUser) {
    return '';
  } else if (message.isError) {
    return 'rounded-3xl rounded-tl-md bg-red-500';
  } else {
    return 'rounded-[40] rounded-bl-md bg-[#191A21]';
  }
};

const MessageContainer = ({ children, isUser, message }) => {
  if (isUser) {
    return (
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          maxWidth: '90%',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 100,
          borderBottomRightRadius: 0,
          borderTopRightRadius: DEVICE_TYPE.IOS ? 30 : 100,
        }}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      className={twMerge(
        'px-5 py-4 max-w-[90%]',
        getBubbleStyle({ isUser, message })
      )}
    >
      {children}
    </View>
  );
};

export default ChatBubbleExcuseBuster;
