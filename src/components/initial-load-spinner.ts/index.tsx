import { useColorScheme } from 'nativewind';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { LOADING_MESSAGES_INITIAL_APP_LOAD } from '@/constants/loading-messages';

import BounceLoader from '../bounce-loader';
import Branding from '../branding';
import ScreenWrapper from '../screen-wrapper';
import { colors } from '../ui';

const InitialLoadSpinner = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScreenWrapper>
      <View className="top-[-50] flex-1 items-center justify-center gap-3">
        <Branding
          isLogoVisible
          className="top-[-25]"
          imageClassname="size-[90px]"
        />
        {/* Rotating Spinner */}
        <ActivityIndicator
          size="large"
          className="items-center justify-center"
          color={isDark ? colors.charcoal[300] : colors.charcoal[100]}
        />
        {/* Fading Loading Message */}
        <BounceLoader
          loadingMessages={LOADING_MESSAGES_INITIAL_APP_LOAD}
          textClassName="text-white dark:text-white"
          className="w-full"
        />
      </View>
    </ScreenWrapper>
  );
};

export default InitialLoadSpinner;
