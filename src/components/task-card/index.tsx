/* eslint-disable max-lines-per-function */
import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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
  className,
  isCreatingTaskPending,
}: ITaskCardProps) => {
  const isTaskCompleted = status === 'completed';

  // Placeholder for image loading error
  const handleImageError = () => {
    // In React Native, you might replace the image source or show a default image
    // For simplicity, we'll just log an error or use a local placeholder if available.
    console.error('Failed to load image for task:', activityName);
    // A more robust solution would involve setting a state to change the image source
    // For example: setFallbackImage(true); and then conditionally render a local image
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
      <TouchableOpacity
        onPress={handleCompleteTask}
        disabled={isTaskCompleted || !!onCreateTask}
        className={`my-2 flex-row items-center rounded-xl shadow-lg ${className}`}
        accessibilityLabel="Mark task as complete" // For accessibility in React Native
      >
        {/* Task Image */}
        <View className="mr-4 ">
          <Image
            source={require('../../components/ui/assets/images/task.png')}
            alt={activityName} // 'alt' is not a prop for Image in React Native, but good for context
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              resizeMode: 'cover',
            }}
            onError={handleImageError}
          />
        </View>

        {/* Task Details */}
        <View className="grow flex-col justify-center">
          <Text className="w-[90%] font-bold-poppins leading-tight text-white">
            {activityName}
          </Text>

          <View className="mt-1.5 flex-row items-center gap-2 text-white">
            <ClockIcon />
            {/* text-gray-300 */}
            <Text className="font-medium-poppins text-sm text-white">
              {durationMinutes} min
            </Text>
          </View>

          <View className="mt-1.5 flex-row gap-4">
            <View className="flex-row items-center gap-2">
              <GemIcon width={20} height={20} />
              <Text className="font-medium-poppins text-sm text-white dark:text-white">
                {gemsEarned}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <FlashIcon width={20} height={20} />
              <Text className="font-medium-poppins text-sm text-white dark:text-white">
                {xpEarned} XP
              </Text>
            </View>
          </View>
        </View>

        {/* Status Indicator / Action Button */}

        <>
          {!onCreateTask &&
            (isTaskCompleted ? (
              // If task is completed, render the CheckListIcon
              <CheckListIcon />
            ) : (
              <View
                className="flex size-7 items-center justify-center rounded-full border-2 border-gray-500"
                accessibilityLabel="Mark task as complete" // For accessibility in React Native
              >
                {/* Empty circle for active task */}
              </View>
            ))}
        </>
      </TouchableOpacity>
      {!!onCreateTask && (
        <Button
          label="Accept challenge 🔥"
          loading={isCreatingTaskPending}
          variant="default"
          className="h-[35px] w-full rounded-lg bg-[#3B82F6] pl-5 active:opacity-80 dark:bg-[#3B82F6]"
          textClassName="text-base text-center text-white dark:text-white"
          onPress={onCreateTask}
        />
      )}
    </>
  );
};
export default TaskCard;
