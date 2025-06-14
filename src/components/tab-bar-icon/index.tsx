import { useEffect } from 'react';
import { Animated } from 'react-native';

import { type ITabBarIcon } from './tab-bar-icon.interface';

export const TabBarIcon = ({
  icon,
  focused,
  textClassName,
  isScanScreen,
  _title,
}: ITabBarIcon) => {
  // Create animation value
  const scaleValue = new Animated.Value(focused ? 1 : 0.8);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused && !isScanScreen ? 0.9 : 0.8,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [focused, scaleValue]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
      className={` mt-8 size-[60] flex-col items-center justify-center  rounded-full  p-2 ${focused ? 'bg-black' : !focused && isScanScreen ? 'bg-[#3195FD]' : 'bg-black'} ${isScanScreen ? '-top-8 size-[80]' : 'top-2'}`}
    >
      {icon}
      {/* <Text className={textClassName}>{title}</Text> */}
    </Animated.View>
  );
};
