import React from 'react';
import { View } from 'react-native';

import { translate } from '@/core';
import { getDynamicGreeting } from '@/core/utilities/get-dynamic-greeting';

import { Text } from '../ui';
import { type IGreeting } from './greeting.interface';

const Greeting = ({
  showGreeting,
  userName,
  additionalClassName,
  textClassName,
}: IGreeting) => {
  const mainMessage = showGreeting
    ? getDynamicGreeting()
    : translate('general.welcomeMessage');

  return (
    <View className={`w-full flex-row items-center ${additionalClassName}`}>
      <Text
        className={`font-semibold-poppins text-[18px] text-blue-500 dark:text-blue-500  ${textClassName}`}
      >
        {userName ? `${mainMessage}, ${userName}! 👋` : `${mainMessage}! 👋`}
      </Text>
    </View>
  );
};

export default Greeting;
