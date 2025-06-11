import { TouchableOpacity, View } from 'react-native';

import SquareCheckbox from '../square-checkbox';
import { colors, Text } from '../ui';
import { type iSelectableButton } from './selectable-button.interface';

/**
 * A customizable button component that can be selected, featuring an icon, text, and a square checkbox indicator.
 * @param {SelectableButtonProps} props - The properties for the component.
 * @param {string} props.icon - The emoji or character to display as an icon.
 * @param {string} props.text - The main text content of the button.
 * @param {boolean} props.isSelected - Indicates whether the button is currently selected.
 * @param {() => void} props.onPress - The function to call when the button is pressed.
 */
const SelectableButton = ({
  icon,
  text,
  isSelected,
  onPress,
}: iSelectableButton) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`
        mx-4 my-2 h-[56px] flex-row
        items-center justify-between rounded-2xl bg-gray-800
        px-4 py-3
        ${isSelected ? 'border-2 border-blue-500' : 'border border-transparent'}
      `}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center">
        <Text className="mr-3 text-2xl text-white">{icon}</Text>
        <Text className="text-base font-semibold text-white">{text}</Text>
      </View>
      {/* Square Checkbox implementation */}
      <SquareCheckbox
        isSelected={isSelected}
        onPress={onPress}
        size={18}
        color={colors.white}
      />
    </TouchableOpacity>
  );
};

export default SelectableButton;
