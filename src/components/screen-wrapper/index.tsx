import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

import { DEVICE_TYPE } from '@/core';

import { FocusAwareStatusBar, SafeAreaView } from '../ui';

const ScreenWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <LinearGradient
      colors={['#000000', '#0a1420']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0.5 }}
      locations={[0.5, 1]}
      style={{ flex: 1 }}
    >
      <SafeAreaView className={`flex-1 ${DEVICE_TYPE.ANDROID ? 'mt-4' : ''}`}>
        <FocusAwareStatusBar hidden />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ScreenWrapper;
