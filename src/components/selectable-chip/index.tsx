import React from 'react';
import { TouchableOpacity, View } from 'react-native';

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
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`
        mb-3 ml-3 flex-row items-center rounded-xl px-6 py-2.5
        ${isSelected ? 'bg-[#4E52FB]' : 'bg-[#191A21]'}
        ${className}
      `}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <Text
        className={`
          text-center font-['Poppins-Medium'] text-sm text-white
          ${textClassName}
        `}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SelectableChip;
