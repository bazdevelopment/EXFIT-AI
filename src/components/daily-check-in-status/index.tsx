import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useSelectedLanguage } from '@/core';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';

import { Text } from '../ui';
import { type IDailyCheckInStatus } from './daily-check-in-status.interface';

const DailyCheckInStatus = ({
  status,
  additionalClassname,
  onAddActivity, // New prop for add button handler
}: IDailyCheckInStatus & { onAddActivity?: () => void }) => {
  const { language } = useSelectedLanguage();
  const currentDay = getCurrentDay('MMM D', language);
  const isAttended = status === 'attended' || status === 'completed';

  // Dynamic gradient colors based on answer
  const gradientColors = ['#10B981', '#059669', '#047857'];
  // ? ['#10B981', '#059669', '#047857']
  // : ['#f35252', '#f04343', '#e52e4d']; // Purple gradient for No
  return (
    <View className={`mx-3 ${additionalClassname}`}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl shadow-lg"
        style={{
          shadowColor: '#10B981',
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
          {/* Header row with date and add button */}
          <View className="mb-1 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 rounded-xl bg-white/25 p-2 backdrop-blur-sm">
                <Text className="font-bold-poppins text-sm font-black text-white">
                  {currentDay}
                </Text>
              </View>
              <View>
                <Text className="font-bold-poppins text-lg text-white">
                  Daily check-in
                </Text>
                {/* Status badge under the title */}
                <View className="mt-0.5 flex-row items-center self-start rounded-full bg-white/25 px-2 py-0.5">
                  <Feather
                    name={isAttended ? 'check' : 'x'}
                    size={12}
                    color="white"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="font-bold-poppins text-xs text-white/90">
                    {isAttended ? 'Attended' : 'Skipped'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Add button */}
            {/* {isAttended &&  */}
            <TouchableOpacity
              onPress={onAddActivity}
              className="rounded-full bg-white/20 p-2 backdrop-blur-sm"
              activeOpacity={0.7}
            >
              <Feather name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content row with message */}
          <View className="mt-1">
            <Text className="font-medium-poppins text-sm leading-5 text-white">
              {isAttended
                ? "You showed up today, that's how progress is built. Keep going!"
                : "The couch wins today… but tomorrow, you're making a comeback!"}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default DailyCheckInStatus;
