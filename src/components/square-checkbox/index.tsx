import React from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';

interface SquareCheckboxProps {
  isSelected: boolean;
  onPress: (event: GestureResponderEvent) => void;
  size?: number; // Outer circle size
  color?: string; // Border and inner dot color
  style?: ViewStyle; // Additional custom styles
}

const SquareCheckbox: React.FC<SquareCheckboxProps> = ({
  isSelected,
  onPress,
  size = 20,
  color = 'white',
  style,
}) => {
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size }}>
      <View
        className="rounded-md border-2"
        style={[
          {
            width: size,
            height: size,
            borderColor: color,
          },
          style,
        ]}
      >
        {isSelected && (
          <View
            className="m-auto rounded"
            style={{
              width: size * 0.4,
              height: size * 0.4,
              backgroundColor: color,
            }}
          />
        )}
      </View>
    </Pressable>
  );
};

export default SquareCheckbox;
