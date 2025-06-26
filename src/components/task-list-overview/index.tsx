import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getCalendars } from 'expo-localization';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import dayjs from '../../lib/dayjs';
import { colors, Text } from '../ui';

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

// Utility function for time formatting
const formatTime = (dateString: string, timeZone: string) => {
  return dayjs(dateString).tz(timeZone).format('h:mm A');
};

const { width: screenWidth } = Dimensions.get('window');

const TaskListOverview: React.FC<TaskListOverviewProps> = ({
  tasks,
  onCompleteTask,
  onSkipTask,
  additionalClassName = '',
}) => {
  const [{ timeZone }] = getCalendars();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const activeTasksCount =
    tasks?.filter((t) => t.status === 'active').length || 0;
  const totalTasksCount = tasks?.length || 0;

  // Define the width of each card to show a peek of the next/previous one
  const cardWidth = screenWidth * 0.8; // Each card takes up 80% of the screen width
  const cardSpacing = 16; // Spacing between cards (increased for better visual separation)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (cardWidth + cardSpacing));
    setActiveIndex(index);
  };

  return (
    <View
      style={{ flex: 1, paddingHorizontal: 0 }}
      className={additionalClassName}
    >
      {/* Header */}
      <View style={{ marginBottom: 6, paddingHorizontal: 16 }}>
        <Text className="font-extra-bold-nunito text-xl text-white">
          Today's Tasks
        </Text>
        {totalTasksCount > 0 && (
          <Text style={{ marginTop: 4, fontSize: 14, color: '#94a3b8' }}>
            {activeTasksCount > 0
              ? `${activeTasksCount}/${totalTasksCount} active`
              : 'All tasks completed! ✨'}
          </Text>
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
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6"
            contentContainerStyle={{
              gap: cardSpacing,
            }}
            decelerationRate="fast"
            snapToInterval={cardWidth + cardSpacing}
            snapToAlignment="start"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {tasks.map((task: Task) => (
              <View key={task.id} style={{ width: cardWidth }}>
                <TaskCard
                  task={task}
                  onCompleteTask={onCompleteTask}
                  onSkipTask={onSkipTask}
                  timeZone={timeZone ?? 'UTC'}
                />
              </View>
            ))}
          </ScrollView>
          {/* Pagination Dots */}
          {tasks.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 16,
              }}
            >
              {tasks.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === activeIndex ? colors.white : '#64748b',
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          )}
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

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onCompleteTask,
  onSkipTask,
  timeZone,
}) => {
  const { gradient, icon, statusText, neonColor } = statusStyles[task.status];
  const isTaskActive = task.status === 'active';

  return (
    <View className={`${neonGlass} overflow-hidden ${neonColor}`}>
      <LinearGradient colors={gradient} style={{ padding: 10 }}>
        {/* Main Content */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              className="font-bold-nunito text-lg text-white"
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {/* Display streak points clearly */}
            {isTaskActive && typeof task.streakPoints === 'number' && (
              <Text className="mt-0.5 font-bold-nunito text-base text-yellow-300">
                Win {task.streakPoints} 🔥
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            {/* Due Time with Icon */}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Feather name="clock" size={12} color="#ffffff" />
              <Text className="font-semibold-nunito text-sm text-white">
                Due: {formatTime(task.expiresAt, timeZone)}
              </Text>
            </View>
            {/* Duration with Icon */}
            <View
              className={`${neonGlass} border px-2 py-0.5 ${neonColor} flex-row items-center gap-1`}
            >
              <Feather name="clock" size={12} color="#ffffff" />
              <Text className="text-sm text-white">
                {task.durationMinutes}m
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons or Status */}
        {isTaskActive ? (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              className={`${neonGlass} flex-1 items-center border py-2 ${neonColor} flex-row justify-center gap-2`}
              onPress={() => onCompleteTask?.(task.id)}
            >
              <Feather name="check" size={16} color="#ffffff" />
              <Text className="text-white">Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`${neonGlass} flex-1 items-center border py-2 ${neonColor} flex-row justify-center gap-2`}
              onPress={() => onSkipTask?.(task.id)}
            >
              <Feather name="x" size={16} color="#ffffff" />
              <Text className="text-white">Skip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            className={`${neonGlass} items-center border py-1.5 ${neonColor}`}
          >
            <Text className="text-white">{statusText}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default TaskListOverview;
