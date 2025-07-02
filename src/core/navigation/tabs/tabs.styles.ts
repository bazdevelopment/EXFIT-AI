import { StyleSheet } from 'react-native';

import { colors } from '@/components/ui';

export const getBottomTabBarStyle = (isDark: boolean) =>
  StyleSheet.create({
    tabBarContainer: {
      // paddingTop: 30,
      // paddingBottom: DEVICE_TYPE.ANDROID ? 10 : 26,
      backgroundColor: colors.blackEerie,
      borderRadius: 100,
      justifyContent: 'center',
      alignSelf: 'center',
      width: '90%',
      bottom: 30,
      height: 80,
      alignItems: 'center',
      shadowColor: colors.black,
      borderWidth: 0.5,
      borderTopWidth: 0.5,
      borderColor: colors.charcoal[800],
    },
    tabBarLabel: {
      color: 'red',
      display: 'none',
    },
  });
