import React, { useEffect } from 'react';
import { View } from 'react-native';
import RNRestart from 'react-native-restart';

import ScreenWrapper from '@/components/screen-wrapper';
import { Button, Text } from '@/components/ui';
import { NoInternetIllustration } from '@/components/ui/assets/illustrations';
import { translate } from '@/core';
import { useHaptic } from '@/core/hooks/use-haptics';
import { playSound } from '@/core/utilities/play-sound';

const NoInternet = () => {
  const addHeavyHapticEffect = useHaptic('heavy');

  const handleAppRestart = () => {
    RNRestart.restart();
  };

  useEffect(() => {
    playSound('error');
    addHeavyHapticEffect?.();
  }, []);

  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-center">
        <NoInternetIllustration />
      </View>

      <View className="bottom-10 w-full self-start px-6">
        <View className="px-2">
          <Text className="font-semibold-poppins text-3xl">
            {translate('rootLayout.screens.noInternetScreen.heading')}
          </Text>
          <Text className="mt-2 text-gray-600">
            {translate('rootLayout.screens.noInternetScreen.subheading')}
          </Text>
        </View>
        <View className="mt-2">
          <Button
            label={translate('general.tryAgain')}
            variant="default"
            className="mt-6 h-14 w-full rounded-full bg-[#4E52FB] pl-5 active:bg-primary-700 dark:bg-[#4E52FB]"
            textClassName="text-base font-medium-poppins text-center text-white dark:text-white"
            iconPosition="left"
            onPress={handleAppRestart}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default NoInternet;
