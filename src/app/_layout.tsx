// Import  global CSS file
import '../../global.css';

import {
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  NunitoSans_800ExtraBold,
} from '@expo-google-fonts/nunito-sans';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Toaster } from 'sonner-native';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/core';
import usePushNotifications from '@/core/hooks/use-push-notifications';
import { useThemeConfig } from '@/core/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldShowAlert: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
  }),
});

export default function RootLayout() {
  usePushNotifications(); // push notifications popup

  const [fontsLoaded] = useFonts({
    'Font-Regular': NunitoSans_400Regular,
    'Font-SemiBold': NunitoSans_600SemiBold,
    'Font-Light': NunitoSans_300Light,
    'Font-Bold': NunitoSans_700Bold,
    'Font-Medium': NunitoSans_400Regular,
    'Font-Extra-Bold': NunitoSans_800ExtraBold,
  });

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      setTimeout(() => {
        hideSplash();
      }, 500);
    }
  }, [hideSplash, fontsLoaded]);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="sign-up"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="onboarding-first"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="onboarding-second"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="welcome"
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="anonymous-login"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="excuse-buster"
          options={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="chat-screen"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="chat-excuse-buster"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="upgrade-account"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade',
            animationDuration: 500,
          }}
        />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <Toaster
                autoWiggleOnUpdate="toast-change"
                pauseWhenPageIsHidden
              />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
