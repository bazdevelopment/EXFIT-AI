// Ensure @expo/vector-icons is installed in your project
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import SquareCheckbox from '../square-checkbox';
import { colors, Image, Text } from '../ui';
import FemaleIcon from '../ui/assets/icons/female-icon';
import MaleIcon from '../ui/assets/icons/male-icon';

/**
 * GenderCard Component for Expo React Native applications using NativeWind for styling.
 * This component displays a selectable card with a background image, a gender icon,
 * and a custom radio button to indicate selection.
 *
 * @param {object} props - The properties passed to the component.
 * @param {'Female' | 'Male'} props.gender - The gender to display and associate with the card.
 * This also determines the icon.
 * @param {string} props.imageUri - The URI for the background image of the card.
 * Example: "https://example.com/female.jpg" or a local require: require('./assets/female.jpg').
 * @param {boolean} props.isSelected - A boolean indicating whether this card is currently selected.
 * When true, a blue border and an inner radio button dot will appear.
 * @param {function(string): void} props.onPress - A callback function that is invoked when the card
 * is pressed. It receives the 'gender' string of the pressed card as an argument.
 */
const GenderCard = ({
  title,
  gender,
  sourceImage,
  isSelected,
  onGenderSelect,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onGenderSelect(gender)}
      className={`overflow-hidden rounded-[30px] border-4 ${
        isSelected ? 'border-blue-500' : 'border-gray-700'
      }`}
    >
      <View className="relative h-[140px]">
        <View className="absolute ml-4 mt-4 flex-row items-center gap-2">
          {gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
          <Text className="font-medium-poppins text-lg text-white">
            {title}
          </Text>
        </View>

        {/* Male Image */}
        <Image
          source={sourceImage}
          className="-right-20 ml-10 size-full"
          contentFit="cover"
        />
        <View className="absolute inset-0 rounded-xl bg-slate-200 opacity-15" />

        {/* Content */}
        <View className="absolute bottom-6 left-4 flex-row items-center">
          <View className="mr-3">
            <SquareCheckbox
              isSelected={isSelected}
              onPress={() => onGenderSelect(gender)}
              size={18}
              color={colors.white}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GenderCard;
