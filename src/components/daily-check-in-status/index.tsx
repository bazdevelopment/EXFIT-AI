import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

import { useSelectedLanguage } from '@/core';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';

import { Text } from '../ui';
import { type IDailyCheckInStatus } from './daily-check-in-status.interface';

const DailyCheckInStatus = ({ status }: IDailyCheckInStatus) => {
  const { language } = useSelectedLanguage();
  const currentDay = getCurrentDay('MMM D', language);

  // const isAttended = status === 'attended';
  const isAttended = status === 'attended';

  const _resetCheckIn = () => {};

  // Dynamic gradient colors based on answer
  const gradientColors = isAttended
    ? ['#10B981', '#059669', '#047857'] // Green gradient for Yes
    : ['#f35252', '#f04343', '#e52e4d']; // Purple gradient for No
  return (
    <View className="mx-4">
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl shadow-lg"
        style={{
          shadowColor: isAttended ? '#10B981' : '#6366F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 20,
        }}
      >
        {/* Subtle overlay for depth */}
        <View className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />

        <View className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              {/* Header with enhanced styling */}
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 rounded-xl bg-white/25 p-2 backdrop-blur-sm">
                  <Text className="text-sm font-black text-white">
                    {currentDay}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold-nunito text-white">
                    Daily check-in
                  </Text>
                </View>
              </View>

              {/* Compact message */}
              <Text className="mb-3 font-semibold-nunito text-sm text-white">
                {isAttended
                  ? 'You showed up today, that’s how progress is built. Keep going!'
                  : 'The couch wins today… but tomorrow, you’re making a comeback!'}
              </Text>
            </View>

            {/* Compact icon section */}
            <View className="items-center">
              <View className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                <Feather
                  name={isAttended ? 'check-circle' : 'x'}
                  size={28}
                  color="white"
                />
              </View>

              {/* Status indicator */}
              <View className="mt-2 rounded-full bg-white/25 px-2 py-0.5">
                <Text className="text-xs font-bold text-white/90">
                  {isAttended ? 'Attended' : 'Skipped'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default DailyCheckInStatus;
