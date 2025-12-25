/* eslint-disable max-lines-per-function */
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Icon from '@/components/icon';
import { colors, Modal, Text } from '@/components/ui';
import { CalendarIcon } from '@/components/ui/assets/icons';
import { useSelectedLanguage } from '@/core';

import dayjs from '../../../lib/dayjs';

interface NotificationDetailsModalProps {
  data: { title: string; body: string; date: string | Date };
}

export const NotificationDetailsModal = React.forwardRef<BottomSheetModal>(
  ({}, ref) => {
    const height = 350; // Increased height for better content display
    const snapPoints = React.useMemo(() => [height, '70%'], [height]);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { language } = useSelectedLanguage();

    return (
      <Modal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: colors.transparent,
        }}
      >
        {({ data }: NotificationDetailsModalProps) => {
          const { title, body, date } = data;
          return (
            <View className="flex h-full flex-col">
              <BlurView
                blurAmount={20}
                blurType="dark"
                style={[StyleSheet.absoluteFill]}
              />
              {/* Date */}
              <View className="ml-4 mt-2 flex-row items-center gap-2">
                <Icon
                  icon={<CalendarIcon />}
                  size={25}
                  color={isDark ? colors.white : colors.black}
                />
                <Text className="font-medium-poppins text-sm">
                  {dayjs(date).locale(language).format('MMMM D, YYYY | h:mm A')}
                </Text>
              </View>

              {/* Title */}
              <View className="mx-6 mt-2 rounded-xl">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold-poppins text-lg">{title}</Text>
                </View>

                {/* Body */}
                <Text className="mt-2 text-base">{body}</Text>
              </View>
            </View>
          );
        }}
      </Modal>
    );
  }
);

NotificationDetailsModal.displayName = 'NotificationDetailsModal';
