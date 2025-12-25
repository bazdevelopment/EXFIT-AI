import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import { translate, useSelectedLanguage } from '@/core';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';

const ActivityPromptBanner = ({
  containerClassName,
  onShowActivityCompleteModal,
  onShowActivitySkippedModal,
}: {
  containerClassName?: string;
  onShowActivityCompleteModal: () => void;
  onShowActivitySkippedModal: () => void;
}) => {
  const { language } = useSelectedLanguage();
  const currentDay = getCurrentDay('MMM D', language);

  return (
    <View
      className={`w-[95%] self-center overflow-hidden rounded-3xl shadow-lg ${containerClassName}`}
    >
      <LinearGradient
        colors={['#4A90E2', '#316DFD']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Main Flex Container: This is the key change for the layout */}
        <View className="flex-row items-center justify-between p-3">
          {/* Left Column: Contains all text and buttons */}
          <View className="w-full">
            {/* Daily Check-in Pill */}
            <View className="flex-row items-center">
              <View className="mr-2 rounded-xl bg-white/25 p-2 backdrop-blur-sm">
                <Text className="font-bold-poppins text-sm text-white">
                  {currentDay}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold-poppins text-white">
                  {translate('components.ActivityPromptBanner.dailyCheckIn')}
                </Text>
              </View>
            </View>

            {/* Middle Content */}
            <View className="mt-2">
              <Text className="font-medium-poppins text-base text-white">
                {translate(
                  'components.ActivityPromptBanner.bodyMovingQuestion'
                )}
              </Text>
            </View>

            {/* Bottom Buttons */}
            <View className="mt-3 flex-row gap-4">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-xl bg-white/20 p-2 active:bg-white/30"
                onPress={onShowActivityCompleteModal}
              >
                <Text className="font-semibold-poppins text-base text-white">
                  {translate('general.yes')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-xl bg-white/20 p-2 active:bg-white/30"
                onPress={onShowActivitySkippedModal}
              >
                <Text className="font-semibold-poppins text-base text-white">
                  {translate('general.no')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
export default ActivityPromptBanner;
