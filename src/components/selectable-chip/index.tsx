import { TouchableOpacity } from '@gorhom/bottom-sheet';
import React from 'react';
import { type TextStyle, View, type ViewStyle } from 'react-native';

import { Text } from '../ui';

interface ISelectableChip {
  title: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}
/**
 * !!very important here to use import { TouchableOpacity } from '@gorhom/bottom-sheet'; and not from react-native
 */

const SelectableChip = ({
  title,
  isSelected,
  onPress,
  icon,
  style,
  textStyle,
}: ISelectableChip) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          marginBottom: 12,
          marginLeft: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
          paddingHorizontal: 15,
          paddingVertical: 5,
          backgroundColor: isSelected ? '#4E52FB' : '#191A21',
        },
        style,
      ]}
    >
      <>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text
          style={[
            {
              textAlign: 'center',
              fontFamily: 'Poppins-Medium',
              fontSize: 14,
              color: 'white',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </>
    </TouchableOpacity>
  );
};

export default SelectableChip;
