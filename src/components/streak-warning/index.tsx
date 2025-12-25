import React from 'react';
import { Image, View } from 'react-native';

import { translate } from '@/core';

import { Button, colors, Text } from '../ui';
import { StreakFreeze } from '../ui/assets/icons';
import { type IStreakWarning } from './streak-warning.interface';

const StreakWarning = ({
  isStreakReset = false,
  isStreakFreezeUsed = false,
  isStreakRepaired = false,
  isElixirUsageExpired = true,
  onRepairStreak,
  isRepairStreakPending = false,
}: IStreakWarning) => {
  // Streak Reset Warning
  if (isStreakReset) {
    return (
      <View className="mb-4 w-full rounded-2xl border border-blue-500/50 bg-blue-500/20 p-4">
        <View className="mb-2 flex-row items-center justify-center">
          <StreakFreeze width={40} height={40} />
          <Text className="font-bold-poppins text-lg text-red-300">
            {translate('components.StreakWarning.streakFreeze')}
          </Text>
        </View>
        <Text className="text-center text-sm text-red-200">
          {translate('components.StreakWarning.streakResetNow')}{' '}
          {`${!isElixirUsageExpired ? translate('components.StreakWarning.streakRepairUse') : ''}`}
        </Text>

        {!isElixirUsageExpired ? (
          <Button
            label={translate('components.StreakWarning.repairStreak')}
            className="mt-4 w-full rounded-full active:opacity-80"
            onPress={onRepairStreak}
            textClassName="font-medium-poppins text-base"
            loading={isRepairStreakPending}
            loadingAnimationColor={colors.black}
          />
        ) : (
          <Text className="mt-4 text-center text-sm text-red-200">
            {translate('components.StreakWarning.streakRepairExpired')}
          </Text>
        )}
      </View>
    );
  }

  // Streak Freeze Used Warning
  if (isStreakFreezeUsed) {
    return (
      <View className="mb-4 w-full rounded-2xl border border-blue-500/50 bg-blue-500/20 p-4">
        <View className="mb-2 flex-row items-center justify-center">
          <Image
            source={require('../ui/assets/images/shop/streak-freeze-potion.png')}
            className="right-1 size-[32]"
          />
          <Text className="font-bold-poppins text-lg text-red-300">
            {translate('components.StreakWarning.streakPotionConsumed')}
          </Text>
        </View>
        <Text className="text-center text-sm text-red-200">
          {translate('components.StreakWarning.streakFreezeApplied')}
        </Text>
      </View>
    );
  }

  // Streak Repaired Warning
  if (isStreakRepaired) {
    return (
      <View className="mb-4 w-full rounded-2xl border border-rose-500/50 bg-rose-500/20 p-4">
        <View className="mb-2 flex-row items-center justify-center">
          <Image
            source={require('../ui/assets/images/shop/streak-revival-elixir.png')}
            className="right-1 size-[32]"
          />
          <Text className="font-bold-poppins text-lg text-red-300">
            {translate('components.StreakWarning.streakElixirApplied')}
          </Text>
        </View>
        <Text className="text-center text-sm">
          {translate('components.StreakWarning.streakFreezePotionApplied')}
        </Text>
      </View>
    );
  }

  return null;
};

export default StreakWarning;
