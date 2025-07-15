import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '../ui';
import { FlashIcon, GemIcon, StreakIcon } from '../ui/assets/icons';

// Define the props for the Greeting component
interface IRewardsOverview {
  userName: string;
  showGreeting?: boolean;
  avatarUri?: string;
  gemsBalance: boolean;
  showStreaks: boolean;
  streakBalance: number;
  xpBalance: number;
}

const RewardsOverview = ({
  showGreeting = true,
  gemsBalance,
  xpBalance,
  streakBalance,
  showStreaks = false,
}: IRewardsOverview) => {
  // Function to get the appropriate greeting based on the current hour

  return (
    <View className="items-start">
      <View className="flex-row">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="flex-row items-center gap-3 rounded-full py-1.5">
            <GemIcon width={20} height={20} />
            <Text className="font-semibold-poppins text-base text-white dark:text-white">
              {gemsBalance}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-2 rounded-full py-1.5">
            <FlashIcon width={20} height={20} />
            <Text className="font-semibold-poppins text-base text-white dark:text-white">
              {xpBalance} XP
            </Text>
          </TouchableOpacity>
          {showStreaks && (
            <View className="flex-row items-center gap-2 rounded-full ">
              <StreakIcon width={24} height={24} />
              <Text className="font-bold-poppins text-base text-blue-200">
                {streakBalance}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default RewardsOverview;
