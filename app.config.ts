/* eslint-disable max-lines-per-function */
import type { ConfigContext, ExpoConfig } from '@expo/config';
import type { AppIconBadgeConfig } from 'app-icon-badge/types';

// Update the import path to a relative path if the file exists at that location
import { ClientEnv, Env } from './env';

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.APP_ENV !== 'production',
  badges: [
    {
      text: Env.APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.NAME,
  description: `${Env.NAME} Mobile App`,
  owner: 'bazdevelopment',
  scheme: Env.SCHEME,
  slug: 'exfit-ai',
  version: Env.VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon-2.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  platforms: ['ios', 'android'],

  ios: {
    appStoreUrl:
      'https://apps.apple.com/us/app/exfit-ai-crush-your-excuses/id6749510101',
    supportsTablet: true,
    bundleIdentifier: Env.BUNDLE_ID,
    googleServicesFile: ClientEnv.GOOGLE_SERVICES_PLIST_PATH,
    associatedDomains: [
      'applinks:exfit-ai-dev-9d0fe.firebaseapp.com', // Important for iOS Universal Links
      'applinks:exfit-ai-dev-9d0fe.firebaseapp.com/scan',
    ],
    config: {
      usesNonExemptEncryption: false, // Avoid the export compliance warning on the app store
    },
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      CFBundleLocalizations: [
        'en', // English
        // 'zh', // Chinese
        // 'es', // Spanish
        // 'hi', // Hindi
        // 'ar', // Arabic
        // 'pt', // Portuguese
        // 'ru', // Russian
        // 'ja', // Japanese
        // 'ko', // Korean
        // 'de', // German
        // 'fr', // French
        // 'ro', // Romanian
      ],
      CFBundleDevelopmentRegion: 'en', // Default language, adjust if needed
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    softwareKeyboardLayoutMode: 'pan',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.exfit',
    googleServicesFile: ClientEnv.GOOGLE_SERVICES_JSON_PATH,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon-2.png',
      backgroundColor: '#3b82f6',
    },
    package: Env.PACKAGE,
    intentFilters: [
      {
        action: 'VIEW',
        data: [
          {
            scheme: 'https',
            host: 'exfit-ai-dev-9d0fe.firebaseapp.com',
            pathPrefix: '/completeLogin', // This is important to match your Firebase link path
          },
          {
            scheme: 'exfit', // Your custom scheme for Android
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-quick-actions',
      {
        androidIcons: {
          heart_icon: {
            foregroundImage: './assets/heart-icon-android.png',
            backgroundColor: '#FFFFFF',
          },
        },
        iosIcons: {
          heart_icon: './assets/heart-icon-ios.png',
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/icon_notification_96x96_2.png',
        color: '#1d1e3c',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#000000',
        image: './assets/splash-icon-2.png',
        imageWidth: 150,
      },
    ],
    [
      'expo-font',
      {
        fonts: ['./assets/fonts/Inter.ttf'],
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: '35.0.0',
        },
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    'expo-localization',
    'expo-router',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-firebase/crashlytics',
    ['app-icon-badge', appIconBadgeConfig],
    [
      'react-native-edge-to-edge',
      {
        android: {
          parentTheme: 'Default',
          enforceNavigationBarContrast: false,
        },
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow $(PRODUCT_NAME) to access your camera to capture images for AI analysis',
      },
    ],
  ],
  extra: {
    ...ClientEnv,
    eas: {
      projectId: Env.EAS_PROJECT_ID,
    },
  },
});
