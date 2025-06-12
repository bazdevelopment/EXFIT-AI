import React from 'react';
import { Image, Text, View } from 'react-native';

// Define the props for the Greeting component
interface GreetingProps {
  userName: string;
  showGreeting?: boolean;
  avatarUri?: string;
}

const Greeting: React.FC<GreetingProps> = ({
  userName,
  showGreeting = true,
  avatarUri,
}) => {
  // Function to get the appropriate greeting based on the current hour
  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  // Determine the main message based on the showGreeting prop
  const mainMessage = showGreeting ? getDynamicGreeting() : 'Welcome';

  return (
    <View className="flex-row items-center bg-black p-4">
      {/* Conditionally render the avatar if avatarUri is provided */}
      {avatarUri && (
        <Image
          source={avatarUri}
          className="mr-4 size-16 rounded-full" // Tailwind classes for styling the avatar
          accessibilityLabel="User Avatar"
          onError={(e) =>
            console.error('Failed to load avatar image:', e.nativeEvent.error)
          }
        />
      )}

      <View className="flex-col">
        {/* Main greeting/welcome message */}
        <Text className="mb-1 text-[20px] font-bold text-blue-500">
          {mainMessage},
        </Text>
        {/* User name/caption */}
        <Text className="text-[20px] font-bold text-white">{userName}!</Text>
        <View className="mt-1 flex-row items-center">
          <Text className="">🔥</Text>
          <Text className="ml-1 font-bold-nunito text-white">100</Text>
        </View>
      </View>
      {/* <View>
        <LinearGradient
          colors={['#3195FD', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-3/5 flex-row items-center justify-center rounded-full p-2"
          style={{
            // width: '90%',
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 100,
            paddingVertical: 5,
            paddingHorizontal: 15,
            alignSelf: 'flex-start',
            marginLeft: 20,
          }}
        >
          <Text className="text-2xl">🔥</Text>
          <Text className="ml-3 font-semibold text-white">100</Text>
        </LinearGradient>
      </View> */}
    </View>
  );
};

export default Greeting;
