import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { DEVICE_TYPE } from '@/core';

import { Text } from '../ui';

//!wrapped is needed because on android blur view doesn't support nested views
const Wrapper = ({ children }: { children: React.ReactElement }) =>
  DEVICE_TYPE.IOS ? (
    <View className="overflow-hidden rounded-xl">
      <BlurView
        blurType="dark"
        blurAmount={5}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {children}
    </View>
  ) : (
    <View className="rounded-xl bg-black/50 dark:bg-black/50">{children}</View>
  );

const PricingOption = ({ plan, selectedPlan, onSelectOption, badge }) => {
  return (
    <Wrapper>
      <TouchableOpacity onPress={onSelectOption} activeOpacity={0.7}>
        <View
          className={`relative flex-row items-center justify-between rounded-xl p-5 ${selectedPlan === plan.id ? 'border-2 border-white' : ''}`}
        >
          {badge && (
            <View className="absolute right-28 top-2.5 rounded-full bg-blue-500 px-2 py-1">
              <Text className="font-bold-poppins text-sm text-white">
                {badge}
              </Text>
            </View>
          )}

          <View className="flex-1 flex-row items-center">
            <View className="mr-4 size-6 items-center justify-center rounded-full border-2 border-white/30">
              {selectedPlan === plan.id && (
                <View className="size-3 rounded-full bg-white" />
              )}
            </View>
            <View>
              <Text className="font-bold-poppins text-lg text-white dark:text-white">
                {plan.title}
              </Text>
              <Text className="mr-10 text-sm text-white">{plan.subtitle}</Text>
            </View>
          </View>

          <Text className="font-semibold-poppins text-lg text-white">
            {plan.price}
          </Text>
        </View>
      </TouchableOpacity>
    </Wrapper>
  );
};

export default PricingOption;
