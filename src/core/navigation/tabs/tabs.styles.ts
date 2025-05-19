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
      borderWidth: 0,
      borderTopWidth: 0,
      bottom: 30,
      alignItems: 'center',
      shadowColor: colors.black, // iOS shadow color
      // shadowOffset: { width: 0, height: 5 }, // iOS shadow offset
      // shadowOpacity: 0.4, // iOS shadow opacity
      // shadowRadius: 10, // iOS shadow radius
      // elevation: 5, // Android shadow
      ...(isDark && {
        borderTopColor: colors.charcoal[700],
        borderTopWidth: 1,
      }),
    },
    tabBarLabel: {
      color: 'red',
      display: 'none',
    },
  });
