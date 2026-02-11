import React from 'react';
import { View } from 'react-native';

import { Image, Text } from '../ui';

const Branding = ({
  isLogoVisible = true,
  isNameVisible = false,
  className,
  invertedColors,
  imageClassname,
}: {
  isLogoVisible?: boolean;
  isNameVisible?: boolean;
  className?: string;
  invertedColors?: boolean;
  imageClassname?: string;
}) => {
  const textColor = invertedColors ? 'text-black' : 'text-white';
  return (
    <View className={`flex-row items-center ${className}`}>
      {isLogoVisible && (
        <View className="rounded-xl bg-transparent">
          <Image
            source={require('assets/icon-5.png')}
            className={`size-[50px] ${imageClassname}`}
          />
        </View>
      )}

      {isNameVisible && (
        <View className={`${isLogoVisible ? 'ml-3' : ''}`}>
          <Text
            className={`text-center font-bold-poppins text-2xl tracking-[2px] ${textColor}`}
          >
            EXFIT AI
          </Text>
        </View>
      )}
    </View>
  );
};

export default Branding;
