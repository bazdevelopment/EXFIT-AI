import React from 'react';
import { View } from 'react-native';

import { getDynamicGreeting } from '@/core/utilities/get-dynamic-greeting';

import { Image, Text } from '../ui';
import { FlashIcon, GemIcon } from '../ui/assets/icons';

// Define the props for the Greeting component
interface IGreetingProps {
  userName: string;
  showGreeting?: boolean;
  avatarUri?: string;
  gemsBalance: boolean;
  showStreaks: boolean;
  xpBalance: number;
}

const Greeting = ({
  userName,
  showGreeting = true,
  avatarUri,
  gemsBalance,
  xpBalance,
  showStreaks = false,
}: IGreetingProps) => {
  // Function to get the appropriate greeting based on the current hour

  // Determine the main message based on the showGreeting prop
  const mainMessage = showGreeting ? getDynamicGreeting() : 'Welcome';

  return (
    <View className="flex-row items-start p-4">
      {/* Conditionally render the avatar if avatarUri is provided */}
      {avatarUri && (
        <Image
          source={avatarUri}
          className="top-1 mr-4 size-14 rounded-full" // Tailwind classes for styling the avatar
          accessibilityLabel="User Avatar"
          onError={() => console.error('Failed to load avatar image:')}
        />
      )}

      <View className="flex-col">
        {/* Main greeting/welcome message */}
        <Text className="mb-1 text-[18px] font-bold text-blue-500">
          {mainMessage},
        </Text>
        {/* User name/caption */}
        <Text className="text-[18px] font-bold text-white">{userName}!</Text>
        {showStreaks && (
          <View className="mt-2 flex-row gap-4">
            <View className="flex-row items-center gap-2">
              <FlashIcon width={20} height={20} />
              <Text className="text-sm font-semibold dark:text-white">
                {xpBalance} XP
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <GemIcon />
              <Text className="text-md font-bold-nunito text-blue-200">
                {gemsBalance}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Greeting;
