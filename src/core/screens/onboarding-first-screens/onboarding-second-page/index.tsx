import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, View } from 'react-native';

import { OnboardingNavigation } from '@/components/onboarding-first-navigation';
import { Button, Text } from '@/components/ui';

import { type IOnboardingSecondPage } from './onboarding-second-page.interface';

const OnboardingSecondPage = ({
  totalSteps,
  goToNextScreen,
  goToPreviousScreen,
  currentScreenIndex,
  onSkip,
}: IOnboardingSecondPage) => (
  <View className="flex-1 bg-black">
    {/* Background Image with Overlay */}
    <ImageBackground
      source={require('../../../../components/ui/assets/images/male-lift.jpg')}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Dark Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
        locations={[0, 0.9]}
        // className="flex-1"
      >
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
          <View className="flex-1 items-center justify-center">
            {/* Logo Icon */}

            <View className="absolute bottom-[20%] gap-4">
              <Text className="text-center font-extra-bold-nunito text-4xl leading-tight text-white">
                Beat Excuses, Stay Consistent
              </Text>

              {/* Subtitle */}
            <Text className="font-regular-nunito text-center text-lg  text-white">
                Boost Your Mood with AI-Powered Motivation
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
      </LinearGradient>
    </ImageBackground>
  </View>
);

export default OnboardingSecondPage;
