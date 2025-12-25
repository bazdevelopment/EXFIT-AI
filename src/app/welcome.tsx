import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import FadeInView from '@/components/fade-in-view/fade-in-view';
import { Button, FocusAwareStatusBar, Text } from '@/components/ui';
import { DEVICE_TYPE, translate, useIsFirstTime } from '@/core';

const WelcomeScreen = () => {
  const [_, setIsFirstTime] = useIsFirstTime();

  return (
    <View className="flex-1 bg-black">
      <FocusAwareStatusBar hidden />

      <ImageBackground
        source={require('../components/ui/assets/images/intro-image-3.png')}
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
          <View className="mt-[40%] flex-1 items-center justify-center">
            {/* <FadeInView delay={200}>
              <View className="mb-6 mt-14 items-center justify-center rounded-3xl">
                <Image
                  source={require('assets/splash-icon-2.png')}
                  className="size-[100px]"
                />
              </View>
            </FadeInView> */}

            <FadeInView delay={600}>
              <View className={DEVICE_TYPE.IOS ? 'gap-5' : 'gap-10'}>
                <Text className="text-center text-[35px] font-bold tracking-tight text-white dark:text-white">
                  {translate('rootLayout.screens.welcome.count')}{' '}
                  <Text className="text-xl text-[#3195FD]">
                    {' '}
                    {translate('rootLayout.screens.welcome.calories')}
                  </Text>
                </Text>
                <Text className="text-center text-[35px] font-bold tracking-tight text-white dark:text-white">
                  {translate('rootLayout.screens.welcome.track')}{' '}
                  <Text className="text-xl text-[#3195FD]">
                    {translate('rootLayout.screens.welcome.activity')}
                  </Text>
                </Text>

                <View className="h-[2px] w-12 self-center bg-[#3195FD]" />
                <Text className="text-center text-[28px] font-light italic text-white">
                  {translate('rootLayout.screens.welcome.with')}{' '}
                  <Text className="text-xl font-black text-[#3195FD]">
                    EXFIT AI
                  </Text>
                </Text>
              </View>
            </FadeInView>

            {/* <FadeInView delay={800}>
              <View className="mt-4 justify-center gap-2 text-center font-primary-poppins text-lg leading-7 text-white">
                <Text className="font-semibold-poppins text-lg text-white dark:text-white">
                  Track Every Move.
                </Text>
                <Text className="font-semibold-poppins text-lg text-white dark:text-white">
                  Count Every Calorie.
                </Text>
                <Text className="font-semibold-poppins text-lg text-white dark:text-white">
                  Crush Every Excuse.
                </Text>
              </View>
            </FadeInView> */}
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
              label={translate('rootLayout.screens.welcome.startButton')}
              variant="default"
              className="h-[52px] w-full rounded-full bg-[#3B82F6] pl-5 active:opacity-80 dark:bg-[#3B82F6]"
              textClassName="text-lg text-center text-white dark:text-white"
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
