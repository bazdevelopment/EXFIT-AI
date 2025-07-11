import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Camera } from '../ui/assets/icons';

interface CameraCaptureButtonProps {
  onPress?: () => void;
  size?: number;
  disabled?: boolean;
  additionalClassName?: string;
}

const CameraCaptureButton: React.FC<CameraCaptureButtonProps> = ({
  onPress,
  size = 80,
  disabled = false,
  additionalClassName,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center self-center ${additionalClassName}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Outer ring */}
      <View
        className="absolute rounded-full border-2 border-[#2326EA]"
        style={{
          width: size,
          height: size,
        }}
      />
      <LinearGradient
        colors={['#4E52FB', '#2326EA']}
        locations={[0.2, 0.7]}
        style={{
          borderRadius: 100,
        }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: size * 0.85,
            height: size * 0.85,
          }}
        >
          {/* Camera icon */}
          <Camera width={27} height={27} color="white" strokeWidth={2} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CameraCaptureButton;
