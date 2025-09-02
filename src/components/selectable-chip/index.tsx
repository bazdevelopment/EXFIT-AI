import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../ui';
import { type ISelectableChip } from './selectable-chip.interface';

const SelectableChip = ({
  title,
  isSelected,
  onPress,
  icon,
  className,
  textClassName,
}: ISelectableChip) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          zIndex: 1000,
        },
      ]}
      className={`
        mb-3 ml-3 flex-row items-center rounded-xl px-5 py-2
        ${isSelected ? 'bg-[#4E52FB]' : 'bg-[#191A21]'}
        ${className}
      `}
    >
      {icon && <View className="mr-3">{icon}</View>}
      <Text
        className={`
          text-center font-['Poppins-Medium'] text-sm text-white
          ${textClassName}
        `}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default SelectableChip;
