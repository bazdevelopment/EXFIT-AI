/* eslint-disable max-lines-per-function */
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, View } from 'react-native';

import GradientText from '@/components/gradient-text';
import { Button, Image, Text } from '@/components/ui';

const WelcomeScreen = () => (
  <View className="flex-1 bg-black">
    {/* Background Image with Overlay */}
    <ImageBackground
      source={require('../components/ui/assets/images/welcome-image.jpg')}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Dark Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.5]}
        // className="flex-1"
      >
        {/* Content Container */}
        <View className="flex-column h-full justify-between px-6 pb-10">
          {/* Center Section - Logo and Branding */}
          <View className="flex-1 items-center justify-center">
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

            <View className="absolute bottom-20 gap-4">
              <GradientText colors={['#3195FD', '#666AFF']}>
                <Text className="text-center font-extra-bold-nunito text-4xl leading-tight">
                  Lift. Gain. Repeat.
                </Text>
              </GradientText>

              {/* Subtitle */}
              <GradientText colors={['#3195FD', '#666AFF']}>
                <Text className="text-center font-extra-bold-nunito text-lg text-blue-300 opacity-90">
                  Let AI crush your excuses
                </Text>
              </GradientText>
            </View>
          </View>

          {/* Bottom Section - CTA Button */}
          <Button
            label="Get Started"
            withGradientBackground
            className="h-[40px]"
            textClassName="text-white text-center text-lg font-semibold"
            onPress={() => router.navigate('/onboarding-first')}
          />
        </View>
      </LinearGradient>
    </ImageBackground>
  </View>
);

export default WelcomeScreen;
