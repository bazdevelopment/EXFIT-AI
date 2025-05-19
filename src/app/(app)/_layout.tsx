/* eslint-disable max-lines-per-function */
/* eslint-disable react/no-unstable-nested-components */
import { Link, Redirect, SplashScreen, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';

import CustomHeader from '@/components/cusom-header';
import { TabBarIcon } from '@/components/tab-bar-icon';
import { colors, Pressable, SafeAreaView, Text } from '@/components/ui';
import { DEVICE_TYPE, useAuth, useIsFirstTime } from '@/core';
import { useCrashlytics } from '@/core/hooks/use-crashlytics';
import { useHaptic } from '@/core/hooks/use-haptics';
import { tabScreens } from '@/core/navigation/tabs';
import { type ITabsNavigationScreen } from '@/core/navigation/tabs/tabs.interface';
import { getBottomTabBarStyle } from '@/core/navigation/tabs/tabs.styles';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const { logEvent } = useCrashlytics();

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

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <SafeAreaView
      className="flex-1"
      edges={DEVICE_TYPE.ANDROID ? ['bottom'] : []}
    >
      <Tabs
        screenOptions={{
          tabBarStyle: bottomTabBarStyles.tabBarContainer,
          tabBarLabelStyle: bottomTabBarStyles.tabBarLabel,
          tabBarInactiveTintColor: isDark ? colors.white : colors.charcoal[700],
          tabBarActiveTintColor: colors.primary[900],
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
                  textClassName={`text-sm w-full ${focused ? 'font-bold-nunito text-primary-900 dark:text-primary-900' : 'font-medium-nunito'} `}
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

const CreateNewPostLink = () => {
  return (
    <Link href="/feed/add-post" asChild>
      <Pressable>
        <Text className="px-3 text-primary-300">Create</Text>
      </Pressable>
    </Link>
  );
};
