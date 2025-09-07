import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { Platform, StatusBar } from 'react-native';

import colors from './colors';

type Props = { hidden?: boolean };
export const FocusAwareStatusBar = ({ hidden = false }: Props) => {
  const isFocused = useIsFocused();
  // const { colorScheme } = useColorScheme();

  if (Platform.OS === 'web') return null;

  return isFocused ? (
    <>
      <StatusBar translucent backgroundColor={colors.black} />
      {/* <SystemBars style="light" hidden={{ navigationBar: hidden }} /> */}
    </>
  ) : null;
};
