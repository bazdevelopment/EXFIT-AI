import React from 'react';
import { View } from 'react-native';

import { getDynamicGreeting } from '@/core/utilities/get-dynamic-greeting';

import { Text } from '../ui';
import { type IGreeting } from './greeting.interface';

const Greeting = ({
  showGreeting,
  userName,
  additionalClassName,
}: IGreeting) => {
  const mainMessage = showGreeting ? getDynamicGreeting() : 'Welcome';

  return (
    <View className={`w-full flex-row items-center ${additionalClassName}`}>
      <Text className="font-semibold-poppins text-[18px] text-blue-500">
        {userName ? `${mainMessage}, ${userName}! 👋` : `${mainMessage}! 👋`}
      </Text>

      {/* <Text className="font-semibold-poppins text-[18px] text-white">
        {' '}
        {userName}! 👋
      </Text> */}
    </View>
  );
};

export default Greeting;
