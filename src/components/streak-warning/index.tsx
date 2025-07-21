import React from 'react';
import { Image, View } from 'react-native';

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
            Streak freeze!
          </Text>
        </View>
        <Text className="text-center text-sm text-red-200">
          Your streak was reset on this day.{' '}
          {`${!isElixirUsageExpired ? 'Use your Streak Repair Elixir to keep your streak alive' : ''}`}
        </Text>

        {!isElixirUsageExpired ? (
          <Button
            label="Repair Streak"
            className="mt-4 w-full rounded-full active:opacity-80"
            onPress={onRepairStreak}
            textClassName="font-medium-poppins text-base"
            loading={isRepairStreakPending}
            loadingAnimationColor={colors.black}
          />
        ) : (
          <Text className="mt-4 text-center text-sm text-red-200">
            Your 48-hour streak repair window has expired! But hey, new streaks
            mean new opportunities to beat your personal best.
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
            Streak Freeze Potion Consumed!
          </Text>
        </View>
        <Text className="text-center text-sm text-red-200">
          Your Streak Freeze Potion kicked in and protected your streak. You're
          still on fire!
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
            Streak Repair Elixir Potion Kicked In!
          </Text>
        </View>
        <Text className="text-center text-sm">
          You saved your Streak! Your Streak Freeze Potion kicked in and
          protected your streak. You're still on fire!
        </Text>
      </View>
    );
  }

  return null;
};

export default StreakWarning;
