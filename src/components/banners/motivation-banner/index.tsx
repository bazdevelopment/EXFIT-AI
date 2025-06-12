import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

const MotivationBanner = ({
  containerClassName,
}: {
  containerClassName?: string;
}) => {
  return (
    <View
      className={`relative w-[90%] self-center overflow-hidden rounded-3xl bg-[#1C1C1E] shadow-lg ${containerClassName} `}
    >
      <View className="p-6">
        <View className="">
          <Text className="text-xl font-bold leading-tight text-[#3195FD]">
            Need a Motivation Boost? or Feeling Stuck?
          </Text>

          <Text className="mt-3 font-semibold-nunito text-base text-gray-300">
            Let's find a quick win and earn some stakes!
          </Text>

          <View className="mt-4">
            <Button
              label="Beat an excuse now!"
              withGradientBackground
              className="h-[30px] rounded-xl"
              textClassName="text-white font-bold-nunito"
              onPress={() => router.navigate('/onboarding-first')}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
export default MotivationBanner;
