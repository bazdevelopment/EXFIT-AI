import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../ui';
import { type IIcon } from './icon.interface';

const Icon = ({
  icon,
  size = 24,
  color = colors.white,
  label,
  labelStyle = '',
  containerStyle = '',
  iconContainerStyle = '',
  disabled = false,
  onPress,
  showBadge = false,
  badgeClassName = '',
  badgeSize = 10,
  badgeColor,
  badgeCount,
}: IIcon) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  // Clone the icon to dynamically adjust its size and color.
  const clonedIcon = React.cloneElement(icon, {
    width: size,
    height: size,
    color: color,
  });

  return (
    <Wrapper
      onPress={onPress}
      className={`flex flex-col items-center ${containerStyle}`}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View className={iconContainerStyle}>
        {clonedIcon}

        {showBadge && (
          <View
            className={`
            absolute right-0 top-0 items-center justify-center
            ${badgeClassName}
          `}
            style={{
              backgroundColor: badgeColor,
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              // top: 0,
              // right: 0,
            }}
          >
            {/* Optional: Add badge count text for numbers */}
            {badgeCount !== undefined && badgeCount > 0 && badgeCount < 100 && (
              <Text
                className="text-center font-bold text-white"
                style={{ fontSize: badgeSize * 0.6 }}
              >
                {badgeCount > 99 ? '99+' : badgeCount.toString()}
              </Text>
            )}
          </View>
        )}
      </View>
      {label && (
        <Text className={`mt-1 text-sm text-gray-500 ${labelStyle}`}>
          {label}
        </Text>
      )}
    </Wrapper>
  );
};

export default Icon;
