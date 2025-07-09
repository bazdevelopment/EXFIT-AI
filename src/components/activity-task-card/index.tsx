import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { type ICreateTaskRequestData } from '@/api/ai-tasks/ai-tasks.types';
import { useSelectedLanguage } from '@/core';

import { Text } from '../ui';

// --- Compact Activity Task Card ---
const ActivityTaskCard = ({
  task,
  onCreateTask,
  currentStreaks = 150,
  dayLabelTaskCard,
  containerClassName,
}: {
  task: ICreateTaskRequestData;
  dayLabelTaskCard: string;
  currentStreaks: number;
  containerClassName: string;
  onCreateTask: (payload: ICreateTaskRequestData) => void;
}) => {
  const { language } = useSelectedLanguage();
  return (
    <View
      className={`w-full self-center overflow-hidden rounded-2xl shadow-lg ${containerClassName}`}
    >
      <LinearGradient
        colors={['#4fa8a2', '#0f78db']} // Smooth Aqua Blue Wave Gradient
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Main Content Container */}
        <View className="p-4">
          {/* Top Section: Date and Streak */}
          <View className="mb-3 flex-row items-center justify-between">
            <View className="rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur-md">
              <Text className="text-sm font-bold text-white">
                {dayLabelTaskCard}
              </Text>
            </View>
            <View className="flex-row items-center rounded-xl border-white/20 bg-white/10 px-3 py-1.5 shadow-lg">
              <Text className="text-sm font-bold text-white">
                Win {currentStreaks} 🔥
              </Text>
            </View>
          </View>

          {/* Main Content Area */}
          <View className="flex-row items-start justify-between">
            {/* Left Column: Text Content */}
            <View className="w-4/5">
              {/* Task Title */}
              <Text className="mb-1 font-extra-bold-poppins text-2xl leading-tight text-white">
                {task.title}
              </Text>

              {/* Duration */}
              {task.durationMinutes && (
                <View className="mb-3 flex-row items-center gap-2">
                  <Feather name="clock" size={14} color="white" />
                  <Text className="text-sm font-semibold text-white">
                    {task.durationMinutes} minutes
                  </Text>
                </View>
              )}
            </View>

            {/* Right Column: Icon */}
            {/* <View className="items-center">
              <View className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-3 shadow-xl backdrop-blur-md">
                <Feather name="play-circle" size={28} color="#E2E8F0" />
              </View>
            </View> */}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            className="overflow-hidden rounded-xl border border-white/30 shadow-2xl shadow-blue-500/25"
            onPress={() =>
              onCreateTask({
                language,
                title: task.title,
                trigger: 'excuse_buster_chat',
                durationMinutes: 10,
              })
            }
            activeOpacity={0.9}
          >
            <View className="flex-row items-center justify-center px-4 py-3">
              <Text className="text-base font-bold tracking-wide text-white">
                Accept challenge 🔥
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default ActivityTaskCard;
