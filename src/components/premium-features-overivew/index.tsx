import React from 'react';
import { View } from 'react-native';

import { translate } from '@/core';
import getDeviceSizeCategory from '@/core/utilities/get-device-size-category';

import FadeInView from '../fade-in-view/fade-in-view';
import { Text } from '../ui';

// Feature Card Component
const FeatureCard = ({ icon, title }) => (
  <View className="mb-2 flex-row items-center rounded-2xl bg-white/95 p-4 shadow-sm dark:bg-transparent ">
    {/* <View className="mr-4 size-14 items-center justify-center overflow-hidden rounded-full bg-yellow-400">
      {icon}
    </View> */}
    <Text className="mr-4 text-[35px]">{icon}</Text>
    <View className="flex-1">
      <Text className="mb-1 font-semibold-poppins text-base text-gray-900">
        {title}
      </Text>
    </View>
  </View>
);

const PremiumFeaturesOverview = () => {
  const { isVerySmallDevice } = getDeviceSizeCategory();

  const features = [
    {
      icon: '🥗',
      text: translate('components.PremiumFeaturesOverview.first'),
      backgroundColor: 'bg-yellow-100',
      rotation: '-rotate-2' as const,
    },
    {
      icon: '💪',
      text: translate('components.PremiumFeaturesOverview.second'),
      backgroundColor: 'bg-blue-100',
      rotation: 'rotate-2' as const,
    },
    {
      icon: '🏃‍♂️',
      text: translate('components.PremiumFeaturesOverview.third', {
        trialDays: 3,
      }),
      backgroundColor: 'bg-blue-100',
      rotation: 'rotate-2' as const,
    },

    {
      icon: '🏆',
      text: translate('components.PremiumFeaturesOverview.fourth'),
      backgroundColor: 'bg-red-100',
      rotation: 'rotate-2' as const,
    },
  ];

  return (
    <View className={`flex-1 justify-center`}>
      {features.map((feature, index) => (
        <FadeInView key={index} delay={index * 150}>
          <FeatureCard
            icon={feature.icon}
            title={feature.text}
            isVerySmallDevice={isVerySmallDevice}
          />
        </FadeInView>
      ))}
    </View>
  );
};

export default PremiumFeaturesOverview;
