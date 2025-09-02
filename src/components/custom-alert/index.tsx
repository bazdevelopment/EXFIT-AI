/* eslint-disable max-lines-per-function */
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { DEVICE_DIMENSIONS } from '@/constants/device-dimensions';
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

  const alertContent = (
    <Animated.View
      style={{
        height: DEVICE_DIMENSIONS.DEVICE_HEIGHT,
        width: DEVICE_DIMENSIONS.DEVICE_WIDTH,
        opacity: fadeAnim,
        backgroundColor: DEVICE_TYPE.ANDROID ? 'rgba(0, 0, 0, 0.6)' : undefined,
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
        enabled={DEVICE_TYPE.IOS} //!keep it only for ios, there are some issues on android
      />

      <Animated.View
        style={[{ opacity: fadeAnim, position: 'absolute' }]}
        className="size-full flex-1 items-center justify-center"
      >
        <View className="elevation-5 -top-24 mx-[10%] items-center justify-center rounded-full  bg-black/50 dark:bg-blackEerie">
          <LinearGradient
            colors={['#191A21', '#0a1420']}
            start={{ x: 1, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 20,
              borderRadius: 30,
            }}
          >
            {/* Icon Component */}
            {image && (
              <View className="mb-6">
                {/* Add margin below the component */}
                {image}
              </View>
            )}

            {/* Title (bold) */}
            {title && (
              <Text className="text-center font-bold-poppins text-xl text-white dark:text-white">
                {title}
              </Text>
            )}

            {/* Subtitle (normal weight) */}
            {subtitle && (
              <Text className="mt-3 text-center font-medium-poppins text-base text-white dark:text-white">
                {subtitle}
              </Text>
            )}

            {/* Buttons */}
            <View className="mt-4 w-full flex-row justify-between gap-5">
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
          </LinearGradient>
        </View>
      </Animated.View>
    </Animated.View>
  );

  // Conditionally wrap with Modal only for Android
  return DEVICE_TYPE.ANDROID ? (
    <Modal visible={visible} transparent>
      {alertContent}
    </Modal>
  ) : (
    alertContent
  );
};

export default CustomAlert;
