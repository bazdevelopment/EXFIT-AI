/* eslint-disable max-lines-per-function */
import { router } from 'expo-router';
import { generateUniqueId } from 'functions/utilities/generate-unique-id';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import CustomAlert from '../custom-alert';
import Icon from '../icon';
import Toast from '../toast';
import { Button, colors, Image, Text } from '../ui';
import { FlashIcon, GemIcon, TaskListIcon } from '../ui/assets/icons';
import { CheckListIcon } from '../ui/assets/icons/checklist';
import { ClockIcon } from '../ui/assets/icons/clock';
import { type ITaskCardProps } from './task-card.interface';

const TaskCard = ({
  id,
  activityName,
  durationMinutes,
  gemsEarned,
  xpEarned,
  status,
  onCreateTask,
  onCompleteTask,
  description,
  className,
  askCoach,
  isCreatingTaskPending,
}: ITaskCardProps) => {
  const isTaskCompleted = status === 'completed';
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);

  const isDescriptionLong = !!description && description!.length > 100;
  const hideDescriptionAndCoach = !!onCreateTask;
  // Placeholder for image loading error
  const handleImageError = () => {
    console.error('Failed to load image for task:', activityName);
  };

  const handleCompleteTask = async () => {
    Toast.showCustomToast(
      <CustomAlert
        visible
        title="Task Done? Be Honest!"
        subtitle="Did you really crush this one? If so, let's mark it as complete!"
        image={
          <Icon
            size={40}
            color={colors.white}
            containerStyle="rounded-full bg-success-500 size-[50] items-center justify-center"
            onPress={router.back}
            icon={<TaskListIcon />}
          />
        }
        buttons={[
          {
            label: 'Oops, Not Yet',
            variant: '',
            onPress: () => Toast.dismiss(),
            className:
              'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
            buttonTextClassName: 'text-white dark:text-white text-sm',
          },
          {
            label: "Yes, I'm Done!",
            variant: '',
            onPress: async () => {
              try {
                onCompleteTask?.();
              } catch (error) {}
            },
            buttonTextClassName: 'text-white dark:text-white text-sm',
            className:
              'flex-1 rounded-full h-[48] bg-[#4E52FB] dark:bg-[#4E52FB] active:opacity-80',
          },
        ]}
      />,
      {
        duration: 10000000,
      }
    );
  };

  return (
    <>
      <View
        className={`my-1.5 flex-row items-start rounded-xl shadow-lg ${className}`}
      >
        {/* Left Column: Image + Duration + Help Link */}
        <View className="mr-3 w-[50px] items-center">
          <Image
            source={require('../../components/ui/assets/images/task.png')}
            alt={activityName}
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              resizeMode: 'cover',
            }}
            onError={handleImageError}
          />

          {/* Help link under duration */}
          {!hideDescriptionAndCoach && (
            <TouchableOpacity
              onPress={() =>
                router.navigate({
                  pathname: '/chat-screen',
                  params: {
                    conversationId: generateUniqueId(),
                    mediaSource: '',
                    mimeType: '',
                    conversationMode: 'RANDOM_CONVERSATION',
                    question: `${askCoach}\n${activityName}\n${description}`,
                  },
                })
              }
              className="mt-1"
            >
              <Text className="mt-1 text-center font-medium-poppins text-sm text-blue-400 dark:text-blue-400">
                Ask Coach
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content Area */}
        <View className="flex-1">
          {/* Header Row: Title */}
          <View className="flex-row items-center justify-between">
            <Text
              className="flex-1 pr-2 font-bold-poppins text-base leading-tight text-white"
              numberOfLines={2}
            >
              {activityName}
            </Text>
          </View>

          {/* Rewards Row */}
          <View className="mt-1 flex-row items-center gap-4">
            {/* Task Duration  */}
            <View className="flex-row items-center">
              <ClockIcon width={14} height={14} />
              <Text className="ml-1 font-medium-poppins text-sm text-white/90">
                {durationMinutes}m
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <GemIcon width={16} height={16} />
              <Text className="font-medium-poppins text-sm text-white">
                {gemsEarned}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <FlashIcon width={16} height={16} />
              <Text className="font-medium-poppins text-sm text-white">
                {xpEarned} XP
              </Text>
            </View>
          </View>

          {/* Description (Compact Version) */}
          {!!description && !hideDescriptionAndCoach && (
            <View
              className={`mt-1.5 rounded-md border-l-2 border-l-blue-400/50 bg-white/5 px-2 py-1 ${!hideDescriptionAndCoach && 'w-[110%]'}`}
            >
              {isDescriptionExpanded ? (
                <Markdown style={lightStyles}>{description}</Markdown>
              ) : (
                <Text
                  className="text-sm leading-relaxed text-gray-300"
                  numberOfLines={1}
                >
                  {description}
                </Text>
              )}

              {isDescriptionLong && (
                <TouchableOpacity
                  onPress={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="mt-1 self-start"
                  activeOpacity={0.7}
                >
                  <Text className="font-medium-poppins text-sm text-blue-400 dark:text-blue-400">
                    {isDescriptionExpanded ? 'See Less' : 'See More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Right Column: Clear Complete Button */}
        <View className="items-center justify-center">
          {!onCreateTask &&
            (isTaskCompleted ? (
              <View className="rounded-full bg-green-500/20 p-2">
                <CheckListIcon />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleCompleteTask}
                className="mr-1 rounded-full border-2 border-[#4E52FB] bg-[#4E52FB]/10 p-2.5"
                activeOpacity={0.7}
                accessibilityLabel="Mark task as complete"
              >
                <View className="size-4 rounded-full border-2 border-[#4E52FB]" />
              </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Action Button - More Compact */}
      {!!onCreateTask && (
        <Button
          label="Accept challenge 🔥"
          loading={isCreatingTaskPending}
          variant="default"
          className="mt-3 h-[32px] w-full rounded-lg bg-[#3B82F6] active:opacity-80 dark:bg-[#3B82F6]"
          textClassName="text-sm text-center text-white dark:text-white"
          onPress={onCreateTask}
        />
      )}
    </>
  );
};

export default TaskCard;

const lightStyles = {
  body: {
    marginTop: -4,
    marginBottom: -4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
  },
  heading1: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  heading2: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading3: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  paragraph: {
    fontFamily: 'Font-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  list_item: {
    fontFamily: 'Font-Regular',
    fontSize: 12,
    marginBottom: 3,
  },
  span: {
    fontFamily: 'Font-Regular',
    fontSize: 12,
  },
  strong: {
    fontFamily: 'Font-Extra-Bold',
    fontWeight: '800',
    color: '#3195FD',
  },
  em: {
    fontFamily: 'Font-Extra-Bold',
    color: colors.white,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  code_inline: {
    borderRadius: 3,
    fontFamily: 'Font-Mono',
    fontSize: 11,
    color: '#111827',
  },
};
