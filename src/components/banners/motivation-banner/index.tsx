import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, colors, Text } from '@/components/ui';
import { MotivationIcon } from '@/components/ui/assets/icons/motivation';

const MotivationBanner = ({
  containerClassName,
}: {
  containerClassName?: string;
}) => {
  return (
    <View
      className={`relative w-full self-center overflow-hidden rounded-3xl bg-[#2A2D3A] shadow-lg ${containerClassName} `}
    >
      <View className="flex-row items-center p-3">
        {/* Brain Icon */}
        <View className="mr-4 h-full w-[80px] flex-row items-center justify-center rounded-xl bg-[#191A21]">
          <MotivationIcon width={40} height={40} fill={colors.white} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="font-semibold-poppins text-lg text-white">
            Feeling Off? Let's beat that excuse
          </Text>

          <Text className="mt-2 text-sm text-gray-300">
            Quick way to earn XP and gems—let’s go!
          </Text>

          <View className="mt-2">
            <Button
              label="Beat your excuse now!"
              className="h-[34px] rounded-full active:opacity-90"
              textClassName="text-white font-medium-poppins"
              onPress={() => router.navigate('/excuse-buster')}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MotivationBanner;
