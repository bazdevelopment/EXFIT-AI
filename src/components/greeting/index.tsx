import React from 'react';
import { View } from 'react-native';

import { getDynamicGreeting } from '@/core/utilities/get-dynamic-greeting';

import { Image, Text } from '../ui';

// Define the props for the Greeting component
interface GreetingProps {
  userName: string;
  showGreeting?: boolean;
  avatarUri?: string;
  streaks?: number;
  showStreaks?: boolean;
}

const Greeting: React.FC<GreetingProps> = ({
  userName,
  showGreeting = true,
  avatarUri,
  streaks,
  showStreaks = false,
}) => {
  // Function to get the appropriate greeting based on the current hour

  // Determine the main message based on the showGreeting prop
  const mainMessage = showGreeting ? getDynamicGreeting() : 'Welcome';

  return (
    <View className="flex-row items-center p-4">
      {/* Conditionally render the avatar if avatarUri is provided */}
      {avatarUri && (
        <Image
          source={avatarUri}
          className="mr-4 size-16 rounded-full" // Tailwind classes for styling the avatar
          accessibilityLabel="User Avatar"
          onError={() => console.error('Failed to load avatar image:')}
        />
      )}

      <View className="flex-col">
        {/* Main greeting/welcome message */}
        <Text className="mb-1 text-[20px] font-bold text-blue-500">
          {mainMessage},
        </Text>
        {/* User name/caption */}
        <Text className="text-[20px] font-bold text-white">{userName}!</Text>
        {showStreaks && (
          <View className="mt-1 flex-row items-center">
            <Text className="">🔥</Text>
            <Text className="ml-1 font-bold-nunito text-white">
              {streaks || 0}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Greeting;
