import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, View } from 'react-native';

import GradientText from '@/components/gradient-text';
import { Button, FocusAwareStatusBar, Image, Text } from '@/components/ui';
import { useIsFirstTime } from '@/core';

const WelcomeScreen = () => {
  const [_, setIsFirstTime] = useIsFirstTime();

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar hidden />

      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.5]}
        style={{ flex: 1 }}
      >
        {/* Background Image with Overlay */}
        <ImageBackground
          source={require('../components/ui/assets/images/welcome-image.jpg')}
          className="flex-1"
          resizeMode="cover"
        >
          {/* Dark Overlay */}

          {/* Content Container */}
          <View className="flex-column h-full justify-between px-6 pb-10">
            {/* Center Section - Logo and Branding */}
            <View className="mt-14 flex-1 items-center justify-center">
              {/* Logo Icon */}
              <View className="mb-3">
                <Image
                  source={require('assets/splash-icon.png')}
                  style={{ width: 70, height: 70 }}
                />
              </View>

              {/* App Name */}

              <GradientText colors={['#666AFF', '#3195FD']}>
                <Text className="font-extra-bold-nunito text-xl tracking-wider">
                  EXFIT AI
                </Text>
              </GradientText>

              {/* Main Headline */}

              <View className="absolute bottom-10 gap-12">
                <GradientText colors={['#3195FD', '#3195FD']}>
                  <Text className="text-center font-extra-bold-nunito text-3xl leading-10 tracking-[3px]">
                    {/* Move. Gain. Repeat. */}
                    IT'S YOU VS. YOUR EXCUSES!
                  </Text>
                </GradientText>

                {/* Subtitle */}
                {/* <GradientText colors={['#3195FD', '#666AFF']}> */}
                <Text className="text-center font-semibold-nunito  text-white opacity-90">
                  Let EXFIT AI crush your excuses
                </Text>
                {/* </GradientText> */}
              </View>
            </View>

            {/* Bottom Section - CTA Button */}
            <Button
              label="Get Started"
              withGradientBackground
              className="h-[40px]"
              textClassName="text-white text-center text-lg font-semibold"
              onPress={() => {
                setIsFirstTime(false);
                router.navigate('/onboarding-first');
              }}
            />
          </View>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default WelcomeScreen;
