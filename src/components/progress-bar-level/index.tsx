import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { translate } from '@/core';

import { Text } from '../ui';
import { FlashIcon } from '../ui/assets/icons';
import { LevelIcon } from '../ui/assets/icons/level';

interface LevelInfo {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpToNextLevel: number;
  nextLevel: number;
  totalXP: number;
  isMaxLevel: boolean;
}

const ProgressBarLevel: React.FC<{
  levelInfo: LevelInfo;
}> = ({ levelInfo }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progress = levelInfo.isMaxLevel
    ? 100
    : (levelInfo.totalXP / (levelInfo.totalXP + levelInfo.xpToNextLevel)) * 100;

  useEffect(() => {
    // Animate progress bar on mount
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  if (levelInfo.isMaxLevel) {
    return (
      <View className="mx-4 mb-6">
        <View className="flex-row items-center rounded-xl bg-gray-700 p-4">
          <View className="mr-3 size-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600">
            <Text className="text-lg font-bold text-white">👑</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-2 font-medium-poppins text-white">
              {translate('components.ProgressBarLevel.heading')}{' '}
              {levelInfo.currentLevel}
            </Text>
            <View className="h-3 rounded-full bg-gray-600">
              <View className="h-3 w-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-6">
      <View className="flex-row items-center rounded-2xl border border-white/10 bg-charcoal-900 p-4">
        <View className="mr-3 size-12 items-center justify-center rounded-full">
          <LevelIcon />
        </View>
        <View className="flex-1">
          <View className="flex-row gap-1">
            <FlashIcon width={22} height={22} />
            <Text className="mb-2 font-medium-poppins text-white">
              {levelInfo.xpToNextLevel} XP{' '}
              {translate('components.ProgressBarLevel.xpLeft')}{' '}
              {levelInfo.nextLevel}
            </Text>
          </View>
          <View className="relative h-3 overflow-hidden rounded-full bg-gray-600">
            <Animated.View
              className="absolute left-0 top-0 h-3 rounded-full bg-green-500"
              style={{ width: animatedWidth }}
            />
          </View>
          {/* <View className="mt-1 flex-row justify-between">
            <Text className="text-xs text-gray-400">
              {levelInfo.currentLevelXP.toLocaleString()} XP
            </Text>
            <Text className="text-xs text-gray-400">
              {levelInfo.nextLevelXP.toLocaleString()} XP
            </Text>
          </View> */}
        </View>
      </View>
    </View>
  );
};

export default ProgressBarLevel;
