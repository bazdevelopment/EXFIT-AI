import React from 'react';
import { View } from 'react-native';

import { OnboardingNavigation } from '@/components/onboarding-first-navigation';
import { Button, Image, Text } from '@/components/ui';
import { translate } from '@/core/i18n';

import { type IOnboardingThirdPage } from './onboarding-third-page.interface';

const OnboardingThirdPage = ({
  totalSteps,
  goToNextScreen,
  goToPreviousScreen,
  currentScreenIndex,
  onSkip,
}: IOnboardingThirdPage) => (
  <View className="flex-1 bg-black">
    {/* Content Container */}
    <View className="flex-column h-full justify-between px-6 pb-10">
      <View className="mt-[60] w-full flex-row justify-end">
        <Button
          onPress={onSkip}
          label="Skip"
          className="z-10 border-white bg-blackEerie active:opacity-90"
          textClassName="text-white"
          variant="outline"
        />
      </View>
      {/* Center Section - Logo and Branding */}
      <View className="flex-1 items-center">
        {/* Logo Icon */}
        <Image
          source={require('../../../../components/ui/assets/images/women-scan.jpeg')}
          style={{ width: 300, height: 500 }}
          className="-top-[10%]"
        />

        <View className="absolute bottom-1/4 gap-4">
          <Text className="text-center font-semibold-poppins text-3xl leading-tight text-white">
            {translate('onboarding.firstFlow.onboardingThirdPage.heading')}
          </Text>
        </View>
      </View>

      {/* Bottom Section - CTA Button */}
      <OnboardingNavigation
        currentIndex={currentScreenIndex}
        totalSteps={totalSteps}
        onPrevious={goToPreviousScreen}
        onNext={goToNextScreen}
        className="absolute inset-x-0 bottom-20"
        buttonClassName="bg-charcoal-600"
      />
    </View>
  </View>
);

export default OnboardingThirdPage;
