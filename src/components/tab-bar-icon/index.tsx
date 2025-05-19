import { useEffect } from 'react';
import { Animated } from 'react-native';

import { type ITabBarIcon } from './tab-bar-icon.interface';

export const TabBarIcon = ({
  icon,
  focused,
  textClassName,
  _title,
}: ITabBarIcon) => {
  // Create animation value
  const scaleValue = new Animated.Value(focused ? 1 : 0.8);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.05 : 0.8,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [focused, scaleValue]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
      }}
      className={`top-2 mt-8 size-[60] flex-col items-center justify-center  rounded-full p-2 ${focused ? 'bg-white' : 'bg-black'}`}
    >
      {icon}
      {/* <Text className={textClassName}>{title}</Text> */}
    </Animated.View>
  );
};
