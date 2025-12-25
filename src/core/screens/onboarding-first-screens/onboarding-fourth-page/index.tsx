import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, View } from 'react-native';

import { OnboardingNavigation } from '@/components/onboarding-first-navigation';
import { Button, Text } from '@/components/ui';
import { translate } from '@/core/i18n';

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

    {/* Center Section - Logo and Branding */}
    <View className="flex-1 items-center">
      {/* Logo Icon */}
      <ImageBackground
        source={require('../../../../components/ui/assets/images/reward-feature.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
          locations={[0.4, 0.9, 0.9]}
          style={{ flex: 1 }}
        >
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
        </LinearGradient>
      </ImageBackground>

      <View className="absolute bottom-52 gap-4 px-4">
        <Text className="text-center font-bold-poppins text-3xl leading-tight text-white">
          {translate('onboarding.firstFlow.onboardingFourthPage.headingOne')}
        </Text>
        {/* Subtitle */}
        <Text className="text-center font-primary-poppins text-base  text-white">
          {translate('onboarding.firstFlow.onboardingFourthPage.headingTwo')}
        </Text>
      </View>
    </View>
  </View>
);

export default OnboardingFourthPage;
