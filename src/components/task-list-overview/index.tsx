import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getCalendars } from 'expo-localization';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { translate } from '@/core';

import CustomAlert from '../custom-alert';
import Toast from '../toast';
import { Image, Text } from '../ui';
import { CheckListIcon } from '../ui/assets/icons/checklist';
import { CrownIllustration } from '../ui/assets/illustrations';

// Interfaces
interface Task {
  createdAt: string;
  durationMinutes: number;
  expiresAt: string;
  id: string;
  status: 'active' | 'completed' | 'skipped';
  title: string;
  trigger: string;
  streakPoints: number; // Added for streak display
}

interface TaskListOverviewProps {
  tasks: Task[];
  onCompleteTask?: (taskId: string) => void;
  onSkipTask?: (taskId: string) => void;
  additionalClassName?: string;
}

// Status Styling Configuration
const statusStyles = {
  active: {
    gradient: ['#06b6d4', '#3b82f6'],
    icon: 'zap',
    statusText: 'Active',
    neonColor: 'border-cyan-400 ',
  },
  completed: {
    gradient: ['#10b981', '#059669'],
    icon: 'check-circle',
    statusText: 'Done',
    neonColor: 'border-emerald-400 ',
  },
  skipped: {
    gradient: ['#6b7280', '#4b5564'],
    icon: 'skip-forward',
    statusText: 'Skipped',
    neonColor: 'border-gray-400 ',
  },
};

// Glassmorphism with neon borders
const neonGlass = 'bg-white/5 backdrop-blur-lg border rounded-lg';

const TaskListOverview: React.FC<TaskListOverviewProps> = ({
  tasks,
  onCompleteTask,
  onSkipTask,
  additionalClassName = '',
}) => {
  const [{ timeZone }] = getCalendars();

  const activeTasksCount =
    tasks?.filter((t) => t.status === 'active').length || 0;
  const totalTasksCount = tasks?.length || 0;

  return (
    <View
      style={{ flex: 1, paddingHorizontal: 0 }}
      className={additionalClassName}
    >
      {/* Header */}
      <View className="mx-6 mb-3 flex-row items-center gap-4">
        <Text className="font-extra-bold-poppins text-xl text-white">
          Today's tasks
        </Text>
        {totalTasksCount > 0 && (
          <View className=" flex-row items-center">
            {/* Show "Completed" Badge if all tasks are finished */}
            {activeTasksCount === 0 && (
              <View className="rounded-full bg-green-500 px-4 py-1">
                <Text className="font-bold-poppins text-sm text-white">
                  Completed
                </Text>
              </View>
            )}

            {/* Text for active/inactive tasks */}
            <Text className="text-[#94a3b8]">
              {activeTasksCount > 0
                ? `${activeTasksCount}/${totalTasksCount} active`
                : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Tasks List */}
      {!tasks?.length ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            className={`${neonGlass} rounded-full border-slate-500 p-4 shadow-slate-500/20`}
          >
            <Feather name="coffee" size={36} color="#94a3b8" />
          </View>
          <Text
            style={{
              marginTop: 12,
              fontSize: 18,
              fontWeight: '500',
              color: '#ffffff',
            }}
          >
            No Tasks!
          </Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: '#94a3b8' }}>
            Enjoy your free time.
          </Text>
        </View>
      ) : (
        <>
          {tasks.map((task: Task, index) => {
            const isLastItem = tasks.length - 1 === index;
            return (
              <View key={task.id} className="px-5">
                <TaskCard
                  task={task}
                  onCompleteTask={onCompleteTask}
                  onSkipTask={onSkipTask}
                  timeZone={timeZone ?? 'UTC'}
                />
                {!isLastItem && (
                  <View className="my-2 size-0.5 w-full bg-gray-600" />
                )}
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

// Task Card Component
interface TaskCardProps {
  task: Task;
  onCompleteTask?: (taskId: string) => void;
  onSkipTask?: (taskId: string) => void;
  timeZone: string;
}

interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  gems: number;
  xp: number;
  status: 'active' | 'completed'; // Simplified statuses for the new design
  imageSrc: string; // New prop for the task image
}

interface TaskCardProps {
  task: Task;
  onTaskAction?: (taskId: string, newStatus: 'completed' | 'active') => void; // Unified action handler
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onCompleteTask }) => {
  const isTaskCompleted = task.status === 'completed';

  // Placeholder for image loading error
  const handleImageError = () => {
    // In React Native, you might replace the image source or show a default image
    // For simplicity, we'll just log an error or use a local placeholder if available.
    console.error('Failed to load image for task:', task.title);
    // A more robust solution would involve setting a state to change the image source
    // For example: setFallbackImage(true); and then conditionally render a local image
  };

  const handleCompleteTask = async (taskId: string) => {
    Toast.showCustomToast(
      <CustomAlert
        visible
        title={translate('general.attention')}
        subtitle={'Did you complete the task?'}
        image={<CrownIllustration />}
        // imageSource={require('../../')}
        buttons={[
          {
            label: translate('general.close'),
            variant: 'default',
            onPress: () => Toast.dismiss(),
            className:
              'flex-1 rounded-xl h-[48] bg-slate-100 active:opacity-80',
            buttonTextClassName: 'text-black',
          },
          {
            label: translate('general.yes'),
            variant: 'destructive',
            onPress: async () => {
              try {
                onCompleteTask?.(taskId);
              } catch (error) {
                Toast.error(translate('alerts.logoutUnsuccessful'));
              }
            },
            className: 'flex-1 rounded-xl h-[48] active:opacity-80',
          },
        ]}
      />,
      {
        position: 'middle', // Place the alert in the middle of the screen
        duration: Infinity, // Keep the alert visible until dismissed,
      }
    );
  };

  return (
    <TouchableOpacity
      onPress={() => handleCompleteTask?.(task.id)}
      disabled={isTaskCompleted}
      className="my-2 flex-row items-center rounded-xl shadow-lg"
      accessibilityLabel="Mark task as complete" // For accessibility in React Native
    >
      {/* <View className="my-2 flex-row items-center rounded-xl shadow-lg"> */}
      {/* Task Image */}
      <View className="mr-4 ">
        <Image
          source={require('../../components/ui/assets/images/task.png')}
          alt={task.title} // 'alt' is not a prop for Image in React Native, but good for context
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
        <Text className="mb-1 font-semibold leading-tight text-white">
          {task.title}
        </Text>
        <View className="mb-1 flex-row items-center text-gray-300">
          <Feather name="clock" size={16} color="#D1D5DB" className="mr-1" />
          {/* text-gray-300 */}
          <Text className="text-sm text-gray-300">
            {task.durationMinutes} min
          </Text>
        </View>
        <View className="flex-row items-center text-gray-300">
          <MaterialCommunityIcons
            name="diamond"
            size={16}
            color="#60A5FA"
            className="mr-1"
          />
          {/* text-blue-400 */}
          <Text className="mr-3 text-sm text-gray-300">{task.gems} gems</Text>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={16}
            color="#FACC2A"
            className="mr-1"
          />
          {/* text-yellow-400 */}
          <Text className="text-sm text-gray-300">{task.xp} XP</Text>
        </View>
      </View>

      {/* Status Indicator / Action Button */}
      <>
        {isTaskCompleted ? (
          // <Feather name="check-circle" size={32} color="#22C55E" /> // text-green-500
          <CheckListIcon />
        ) : (
          <View
            className="flex size-7 items-center justify-center rounded-full border-2 border-gray-500"
            accessibilityLabel="Mark task as complete" // For accessibility in React Native
          >
            {/* Empty circle for active task */}
          </View>
        )}
      </>
    </TouchableOpacity>
  );
};

export default TaskListOverview;
