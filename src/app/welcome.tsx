import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import FadeInView from '@/components/fade-in-view/fade-in-view';
import { Button, FocusAwareStatusBar, Image, Text } from '@/components/ui';
import { useIsFirstTime } from '@/core';

const WelcomeScreen = () => {
  const [_, setIsFirstTime] = useIsFirstTime();

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar hidden />

      <ImageBackground
        source={require('../components/ui/assets/images/welcome-image.jpg')}
        className="flex-1 justify-end"
        resizeMode="cover"
      >
        {/* Darker, more subtle gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)', '#000000']}
          locations={[0, 0.9, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View className="flex-1 justify-between px-8 pb-12">
          <View className="mt-[30%] flex-1 items-center justify-center">
            <FadeInView delay={200}>
              <View className="mb-6 mt-14 items-center justify-center rounded-3xl">
                <Image
                  source={require('assets/splash-icon-2.png')}
                  className="size-[100px]"
                />
              </View>
            </FadeInView>

            <FadeInView delay={600}>
              <Text className="mb-6 mt-5 text-center text-[35px]  leading-[52px] text-white">
                It's{' '}
                <Text className="text-[35px] text-[#3195FD] dark:text-[#3195FD]">
                  you
                </Text>{' '}
                vs. your
                {'\n'}
                <Text className="text-[35px] text-[#3195FD] dark:text-[#3195FD]">
                  potential
                </Text>
              </Text>
            </FadeInView>

            <FadeInView delay={800}>
              <Text className="mt-4 text-center font-primary-poppins text-lg leading-7 text-white dark:text-white">
                Let{' '}
                <Text className="font-semibold-poppins text-lg text-[#3195FD] dark:text-[#3195FD]">
                  EXFIT AI
                </Text>{' '}
                crush your excuses
              </Text>
            </FadeInView>
          </View>

          <FadeInView delay={1000} className="w-full">
            {/* <Button
              label="Get Started"
              withGradientBackground
              className="h-[38px] rounded-xl"
              textClassName="text-white text-center font-bold tracking-wide"
              onPress={() => {
                setIsFirstTime(false);
                router.navigate('/onboarding-first');
              }}
            /> */}
            <Button
              label="Get Started"
              variant="default"
              className="h-[50px] w-full rounded-full bg-[#3B82F6] pl-5 active:opacity-80 dark:bg-[#3B82F6]"
              textClassName="text-base text-center text-white dark:text-white"
              onPress={() => {
                setIsFirstTime(false);
                router.navigate('/onboarding-first');
              }}
            />
          </FadeInView>
        </View>
      </ImageBackground>
    </View>
  );
};

export default WelcomeScreen;
