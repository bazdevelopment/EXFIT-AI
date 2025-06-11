/* eslint-disable max-lines-per-function */
import React from 'react';
import { View } from 'react-native';

import { OnboardingNavigation } from '@/components/onboarding-first-navigation';
import { Button, Image, Text } from '@/components/ui';

import { type IOnboardingFourthPage } from './onboarding-fourth-page.interface';

const OnboardingFourthPage = ({
  totalSteps,
  goToNextScreen,
  goToPreviousScreen,
  currentScreenIndex,
  isLastScreenDisplayed,
  onFinish,
  onSkip,
}: IOnboardingFourthPage) => (
  <View className="flex-1 bg-black">
    {/* Content Container */}
    <View className="flex-column h-full justify-between px-6 pb-10">
      <View className="mt-[60] w-full flex-row justify-end">
        <Button
          onPress={onSkip}
          label="Skip"
          className="border-white bg-blackEerie active:opacity-90"
          textClassName="text-white"
          variant="outline"
        />
      </View>
      {/* Center Section - Logo and Branding */}
      <View className="flex-1 items-center">
        {/* Logo Icon */}
        <Image
          source={require('../../../../components/ui/assets/images/streak.png')}
          style={{ width: 300, height: 300 }}
          className="mt-[25%]"
        />

        <View className="absolute bottom-[20%] gap-4">
          <Text className="text-center font-extra-bold-nunito text-3xl leading-tight text-white">
            Earn streak rewards and hit your fitness milestones
          </Text>
        </View>
      </View>

      {/* Bottom Section - CTA Button */}
      <OnboardingNavigation
        currentIndex={currentScreenIndex}
        totalSteps={totalSteps}
        onPrevious={goToPreviousScreen}
        onNext={goToNextScreen}
        isLastScreenDisplayed={isLastScreenDisplayed}
        className="absolute inset-x-0 bottom-20"
        buttonClassName="bg-charcoal-600"
        onFinish={onFinish}
      />
    </View>
  </View>
);

export default OnboardingFourthPage;
