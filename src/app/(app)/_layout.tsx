import { useNetInfo } from '@react-native-community/netinfo';
import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import { Redirect, Tabs, useSegments } from 'expo-router';
import { firebaseAuth } from 'firebase/config';
import { checkForAppUpdate } from 'firebase/remote-config';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';

import { useInitializeRevenueCat } from '@/api/subscription/subscription.hooks';
import { useUser } from '@/api/user/user.hooks';
import CustomHeader from '@/components/cusom-header';
import InitialLoadSpinner from '@/components/initial-load-spinner.ts';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { colors, SafeAreaView } from '@/components/ui';
import {
  DEVICE_TYPE,
  translate,
  useIsFirstTime,
  useSelectedLanguage,
} from '@/core';
import { useCrashlytics } from '@/core/hooks/use-crashlytics';
import { useFirstOnboarding } from '@/core/hooks/use-first-onboarding';
import { useHaptic } from '@/core/hooks/use-haptics';
import useKeyboard from '@/core/hooks/use-keyboard';
import { usePushNotificationToken } from '@/core/hooks/use-push-notification-token';
import useRemoteConfig from '@/core/hooks/use-remote-config';
import { useSecondOnboarding } from '@/core/hooks/use-second-onboarding';
import { tabScreens } from '@/core/navigation/tabs';
import { type ITabsNavigationScreen } from '@/core/navigation/tabs/tabs.interface';
import { getBottomTabBarStyle } from '@/core/navigation/tabs/tabs.styles';

import NoInternet from '../no-internet';

export default function TabLayout() {
  const isLoggedIn = !!firebaseAuth.currentUser?.uid;
  const [isFirstTime] = useIsFirstTime();
  const [isFirstOnboardingDone] = useFirstOnboarding();
  const [isSecondOnboardingDone] = useSecondOnboarding();

  const { language } = useSelectedLanguage();
  const { logEvent } = useCrashlytics();
  const { storeDeviceInfo } = usePushNotificationToken();
  const { data: userInfo, isPending: isPendingUserinfo } = useUser(language);
  const addSelectionHapticEffect = useHaptic('selection');
  const { isPending: isPendingRevenueCatSdkInit } = useInitializeRevenueCat(
    firebaseAuth.currentUser?.uid as string
  );
  const segments = useSegments();
  const { isKeyboardVisible } = useKeyboard();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bottomTabBarStyles = getBottomTabBarStyle(isDark);

  useQuickActionRouting();
  const { isConnected } = useNetInfo();
  const { MINIMUM_VERSION_ALLOWED } = useRemoteConfig();
  checkForAppUpdate(MINIMUM_VERSION_ALLOWED);
  // //todo: make sure if it's good to update the user info that often with the subscription data, I did it now in case we need at some point the subscription details in the BE and ot be up to date in case the user cancel the subscription
  // useUpdateUserSubscription(customerInfo);

  useEffect(() => {
    QuickActions.setItems<QuickActions.Action>([
      {
        title: translate('deleteApp.title'),
        subtitle: translate('deleteApp.subtitle'),
        icon: 'heart_icon',
        id: '0',
        params: { href: '/rate' },
      },
    ]);
  }, []);

  useEffect(() => {
    storeDeviceInfo();
  }, []);

  if (isConnected === false && isConnected !== null) return <NoInternet />;

  if (isPendingUserinfo || isPendingRevenueCatSdkInit)
    return <InitialLoadSpinner />;

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

  return (
    <SafeAreaView
      className="flex-1 bg-black"
      edges={DEVICE_TYPE.ANDROID ? ['bottom'] : []}
    >
      <Tabs
        screenOptions={{
          // tabBarHideOnKeyboard: DEVICE_TYPE.ANDROID && isKeyboardVisible,
          tabBarStyle: {
            ...bottomTabBarStyles.tabBarContainer,
            display: segments.includes('scan') ? 'none' : 'flex',
            marginBottom:
              DEVICE_TYPE.ANDROID &&
              isKeyboardVisible &&
              (segments.includes('activity') || segments.includes('(app)'))
                ? -300
                : 0,
          },
          tabBarLabelStyle: bottomTabBarStyles.tabBarLabel,
          tabBarInactiveTintColor: colors.white,
          // tabBarActiveTintColor: '#3195FD',
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
              // tabBarStyle: {
              //   display: tab.screenName === 'scan' ? 'none' : 'flex',
              //   backgroundColor: 'black',
              // },
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon
                  icon={tab.icon(color, focused)}
                  focused={focused}
                  isScanScreen={tab.screenName === 'scan'}
                  textClassName={`text-sm text-center w-full ${focused ? 'font-bold-poppins text-primary-900 dark:text-primary-900' : 'font-medium-poppins'} `}
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
