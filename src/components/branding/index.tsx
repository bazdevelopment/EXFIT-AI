import React from 'react';
import { View } from 'react-native';

import { Image, Text } from '../ui';

const Branding = ({
  isLogoVisible = true,
  isNameVisible = false,
  className,
  invertedColors,
}: {
  isLogoVisible?: boolean;
  isNameVisible?: boolean;
  className?: string;
  invertedColors?: boolean;
}) => {
  const textColor = invertedColors ? 'text-black' : 'text-white';
  return (
    <View className={`flex-row items-center ${className}`}>
      {isLogoVisible && (
        <View className="rounded-xl bg-transparent p-2 dark:bg-blackEerie dark:p-0">
          <Image
            source={require('assets/splash-icon.png')}
            className="size-[50px]"
          />
        </View>
      )}

      {isNameVisible && (
        <View className={`${isLogoVisible ? 'ml-3' : ''}`}>
          <Text
            className={`text-center font-bold-nunito text-2xl tracking-[2px] ${textColor}`}
          >
            EXFIT AI
          </Text>
        </View>
      )}
    </View>
  );
};

export default Branding;
