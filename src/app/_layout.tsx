/* eslint-disable max-lines-per-function */
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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/core';
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Font-Regular': NunitoSans_400Regular,
    'Font-SemiBold': NunitoSans_600SemiBold,
    'Font-Light': NunitoSans_300Light,
    'Font-Bold': NunitoSans_700Bold,
    'Font-Medium': NunitoSans_400Regular,
    'Font-Extra-Bold': NunitoSans_800ExtraBold,
  });
  if (!fontsLoaded) return null;
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
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
            gestureEnabled: false,
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
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      // className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
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
