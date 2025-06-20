/* eslint-disable max-lines-per-function */
import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { DEVICE_DIMENSIONS } from '@/constants/device-dimentions';
import { DEVICE_TYPE } from '@/core';
import useBackHandler from '@/core/hooks/use-back-handler';

import Toast from '../toast';

interface ButtonConfig {
  label: string; // Translated text for the button
  variant: 'default' | 'destructive'; // Button type (e.g., default, danger)
  onPress: () => void; // Button press handler
  className?: string;
  buttonTextClassName?: string;
}

interface CustomAlertProps {
  visible?: boolean;
  title?: string; // Optional title (bold)
  subtitle?: string; // Optional subtitle (normal weight)
  buttons: ButtonConfig[]; // Array of buttons (max 3)
  // Changed type to React.ReactNode (can be JSX.Element, string, number, array of those)
  image?: React.ReactNode; // <--- New prop for the component
}

// eslint-disable-next-line max-lines-per-function
const CustomAlert = ({
  visible = true,
  title,
  subtitle,
  buttons,
  image, // <--- Destructure the new prop
}: CustomAlertProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Validate the number of buttons
  if (buttons.length > 3) {
    throw new Error('CustomAlert can only accept a maximum of 3 buttons.');
  }

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300, // Adjust the duration as needed
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300, // Adjust the duration as needed
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  useBackHandler(() => true);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        height: DEVICE_DIMENSIONS.DEVICE_HEIGHT,
        width: DEVICE_DIMENSIONS.DEVICE_WIDTH,
        opacity: fadeAnim,
        marginRight: DEVICE_TYPE.IOS ? -14 : 0,
      }}
      className="absolute left-0 top-0 items-center justify-center"
    >
      <BlurView
        blurAmount={5}
        blurType="dark"
        style={{
          position: 'absolute',
          top: -2000,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Animated.View
        style={[{ opacity: fadeAnim, position: 'absolute' }]}
        className="size-full flex-1 items-center justify-center"
      >
        <View className="elevation-5 mx-[15%] mt-[-50] items-center justify-center rounded-2xl  bg-black/50 p-7 dark:bg-blackEerie">
          {/* Icon Component */}
          {image && (
            <View className="mb-4">
              {/* Add margin below the component */}
              {image}
            </View>
          )}

          {/* Title (bold) */}
          {title && (
            <Text className="mb-2 text-center font-bold-nunito text-xl text-white dark:text-white">
              {title}
            </Text>
          )}

          {/* Subtitle (normal weight) */}
          {subtitle && (
            <Text className="mb-2 text-center font-primary-nunito text-base text-white dark:text-white">
              {subtitle}
            </Text>
          )}

          {/* Buttons */}
          <View className="mt-2 w-full flex-row justify-between gap-5">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant}
                label={button.label}
                className={button.className}
                textClassName={button.buttonTextClassName}
                onPress={() => {
                  button.onPress();
                  Toast.dismiss();
                }}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export default CustomAlert;
