import { Animated } from 'react-native';

import { DEVICE_TYPE } from '@/core';

import Dot from '../dot';
import { type ITabBarIcon } from './tab-bar-icon.interface';

export const TabBarIcon = ({
  icon,
  focused,
  textClassName,
  isScanScreen,
  _title,
}: ITabBarIcon) => {
  // Create animation value
  const scaleValue = new Animated.Value(focused ? 0.9 : 0.8);

  // useEffect(() => {
  //   Animated.spring(scaleValue, {
  //     toValue: focused && !isScanScreen ? 0.9 : 0.8,
  //     useNativeDriver: true,
  //     friction: 4,
  //   }).start();
  // }, [focused, scaleValue]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
      className={`size-[60] flex-col items-center justify-center  gap-2 rounded-full p-2 ${focused ? 'bg-black' : !focused && isScanScreen ? 'bg-[#3195FD]' : 'bg-black'} ${isScanScreen ? 'size-[75]' : 'top-2'} ${DEVICE_TYPE.IOS ? 'mt-8' : 'mt-8'}`}
    >
      {icon}
      {focused && <Dot color="bg-[#3195FD] w-[5px] h-[5px] rounded-full" />}
    </Animated.View>
  );
};
