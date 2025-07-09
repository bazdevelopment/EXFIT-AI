import React from 'react';
import { View } from 'react-native';

import { getDynamicGreeting } from '@/core/utilities/get-dynamic-greeting';

import { Text } from '../ui';

const Greeting = ({ showGreeting, userName, additionalClassName }) => {
  const mainMessage = showGreeting ? getDynamicGreeting() : 'Welcome';

  return (
    <View className={`w-full flex-row items-center ${additionalClassName}`}>
      <Text className="text-[18px] font-bold text-blue-500">
        {mainMessage},
      </Text>

      <Text className="text-[18px] font-bold text-white"> {userName}! 👋</Text>
    </View>
  );
};

export default Greeting;
