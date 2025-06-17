import { Redirect, SplashScreen, Tabs } from 'expo-router';
import { firebaseAuth } from 'firebase/config';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';

import { useUser } from '@/api/user/user.hooks';
import CustomHeader from '@/components/cusom-header';
import InitialLoadSpinner from '@/components/initial-load-spinner.ts';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { colors, SafeAreaView } from '@/components/ui';
import {
  DEVICE_TYPE,
  useAuth,
  useIsFirstTime,
  useSelectedLanguage,
} from '@/core';
import { useCrashlytics } from '@/core/hooks/use-crashlytics';
import { useFirstOnboarding } from '@/core/hooks/use-first-onboarding';
import { useHaptic } from '@/core/hooks/use-haptics';
import { useSecondOnboarding } from '@/core/hooks/use-second-onboarding';
import { tabScreens } from '@/core/navigation/tabs';
import { type ITabsNavigationScreen } from '@/core/navigation/tabs/tabs.interface';
import { getBottomTabBarStyle } from '@/core/navigation/tabs/tabs.styles';

export default function TabLayout() {
  const status = useAuth.use.status();
  const isLoggedIn = !!firebaseAuth.currentUser?.uid;

  const [isFirstTime] = useIsFirstTime();
  const [isFirstOnboardingDone] = useFirstOnboarding();
  const [isSecondOnboardingDone] = useSecondOnboarding();

  const { language } = useSelectedLanguage();
  const { logEvent } = useCrashlytics();
  const { data: userInfo, isPending: isPendingUserinfo } = useUser(language);

  const addSelectionHapticEffect = useHaptic('selection');

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bottomTabBarStyles = getBottomTabBarStyle(isDark);

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isPendingUserinfo) return <InitialLoadSpinner />;

  if (isFirstTime) {
    return <Redirect href="/welcome" />;
  }
  if (!isFirstOnboardingDone) {
    return <Redirect href="/onboarding-first" />;
  }

  if (!isLoggedIn) {
    logEvent(`User ${userInfo?.userId} is redirected to login screen`);
    return <Redirect href="/anonymous-login" />;
  }

  if (!isSecondOnboardingDone) {
    return <Redirect href="/onboarding-second" />;
  }
  if (!userInfo?.isOnboarded) {
    return <Redirect href="/onboarding-second" />;
  }
  // if (status === 'signOut') {
  //   return <Redirect href="/login" />;
  // }
  //   if (isPendingUserinfo || isPendingRevenueCatSdkInit)

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={DEVICE_TYPE.ANDROID ? ['bottom'] : []}
    >
      <Tabs
        screenOptions={{
          tabBarStyle: bottomTabBarStyles.tabBarContainer,
          tabBarLabelStyle: bottomTabBarStyles.tabBarLabel,
          tabBarInactiveTintColor: colors.white,
          tabBarActiveTintColor: '#3195FD',
        }}
      >
        {tabScreens.map((tab: ITabsNavigationScreen) => (
          <Tabs.Screen
            key={tab.id}
            name={tab.screenName}
            listeners={{
              tabPress: () => {
                addSelectionHapticEffect?.();
                // logEvent(
                //   `User ${userInfo.userId} navigated to ${tab.screenName}`
                // );
              },
            }}
            options={{
              header: (props) =>
                tab.header && (
                  <CustomHeader
                    {...props}
                    title={tab.title}
                    titlePosition="left"
                  />
                ),
              title: tab.title,
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  icon={tab.icon(color, focused)}
                  focused={focused}
                  isScanScreen={tab.screenName === 'scan'}
                  textClassName={`text-sm text-center w-full ${focused ? 'font-bold-nunito text-primary-900 dark:text-primary-900' : 'font-medium-nunito'} `}
                  title={tab.title}
                />
              ),
              tabBarTestID: tab.tabBarTestID,
            }}
          />
        ))}
      </Tabs>
    </SafeAreaView>
  );
}
