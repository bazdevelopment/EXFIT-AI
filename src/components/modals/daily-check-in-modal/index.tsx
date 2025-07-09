/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { useColorScheme } from 'nativewind';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Button, colors, Modal, Text } from '@/components/ui';
import { CheckIcon } from '@/components/ui/assets/icons';

interface ActivityOption {
  id: string;
  label: string;
}

interface DurationOption {
  id: string;
  value: number;
  label: string;
}

interface DailyCheckInModalProps {
  isCreateActivityLogPending: boolean;
  onSubmit?: ({
    durationMinutes,
    activityName,
    type,
  }: {
    durationMinutes: number;
    activityName: string;
    type: string;
  }) => void;
}

export const DailyCheckInModal = React.forwardRef<
  BottomSheetModal,
  DailyCheckInModalProps
>(({ onSubmit, isCreateActivityLogPending }, ref) => {
  const height = 650;
  const snapPoints = useMemo(() => [height, '85%'], [height]);
  const { colorScheme } = useColorScheme();

  // State management
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [customActivity, setCustomActivity] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<string>('');

  const toggleActivity = (activity: string) => {
    setSelectedActivity((prev) => (prev === activity ? '' : activity));
  };

  // Toggle duration selection
  const toggleDuration = (duration: number) => {
    setSelectedDuration((prev) => (prev === duration ? 0 : duration));
  };

  // Activity options
  const activityOptions: ActivityOption[] = [
    { id: 'running', label: 'Running' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'weightlifting', label: 'Weightlifting' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'walking', label: 'Walking' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'stretching', label: 'Stretching' },
  ];

  // Duration options
  const durationOptions: DurationOption[] = [
    { id: '15min', value: 15, label: '15 min' },
    { id: '30min', value: 30, label: '30 min' },
    { id: '45min', value: 45, label: '45 min' },
    { id: '60min', value: 60, label: '60 min' },
    { id: '120min', value: 120, label: '120 min' },
  ];

  const handleSubmit = (data?: { type: string }) => {
    const finalDuration = selectedDuration || parseInt(customDuration) || 0;
    const finalActivity = selectedActivity || customActivity;
    onSubmit?.({
      durationMinutes: finalDuration,
      activityName: finalActivity,
      type: data?.type ?? '',
    });
  };

  const isSubmitDisabled = !(
    (selectedActivity && selectedDuration) ||
    (selectedActivity && customDuration) ||
    (selectedDuration && customActivity) ||
    (customDuration && customDuration)
  );

  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: colors.transparent,
        // opacity: 0.7,
      }}
    >
      {({ data }: { data?: { type: string } } = {}) => {
        return (
          <>
            <BlurView
              blurAmount={20}
              blurType="dark"
              style={[StyleSheet.absoluteFill]}
            />
            <ScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View className="mb-6 mt-2">
                <Text className="text-center font-bold-poppins text-lg text-white">
                  Please mention fitness activity you did and the duration
                </Text>
              </View>
              {/* Popular Activities */}
              <View className="mb-6">
                <Text className="mb-3 font-bold-poppins text-lg text-white">
                  Popular Activities
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {activityOptions.map((activity) => (
                    <TouchableOpacity
                      key={activity.id}
                      onPress={() => toggleActivity(activity.label)}
                      className={`rounded-full border border-white/60 px-4 py-2 ${
                        selectedActivity === activity.label
                          ? 'bg-blue-500'
                          : 'bg-black'
                      }`}
                    >
                      <Text
                        className={`font-semibold-poppins text-sm text-white `}
                      >
                        {activity.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="mt-4">
                  <BottomSheetTextInput
                    keyboardAppearance="dark"
                    value={customActivity}
                    maxLength={100}
                    onChangeText={(text: string) => {
                      setSelectedActivity('');
                      setCustomActivity(text);
                    }}
                    placeholder="Custom activity"
                    placeholderTextColor={colors.charcoal[300]}
                    className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
                    returnKeyType="done"
                  />
                </View>
              </View>
              {/* Duration */}
              <View className="mb-6">
                <Text className="mb-3 font-bold-poppins text-lg font-medium text-white">
                  Duration
                </Text>
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {durationOptions.map((duration) => (
                    <TouchableOpacity
                      key={duration.id}
                      onPress={() => {
                        toggleDuration(duration.value);
                        setCustomDuration('');
                      }}
                      className={`rounded-full border border-white/60 px-4 py-2 ${
                        selectedDuration === duration.value
                          ? 'bg-blue-500'
                          : 'bg-black'
                      }`}
                    >
                      <Text
                        className={`font-semibold-poppins text-sm text-white`}
                      >
                        {duration.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Duration Input */}
                <BottomSheetTextInput
                  value={customDuration}
                  keyboardAppearance="dark"
                  maxLength={3}
                  onChangeText={(text) => {
                    // Remove all non-digit characters
                    const sanitizedText = text.replace(/[^0-9]/g, '');

                    if (Number(sanitizedText.trim()) > 360) {
                      alert('Selected duration cannot exceed 360 minutes');
                      return;
                    }

                    setCustomDuration(sanitizedText);

                    if (sanitizedText.trim()) {
                      setSelectedDuration(0);
                    }
                  }}
                  placeholder="Custom duration (minutes)"
                  placeholderTextColor={colors.charcoal[300]}
                  keyboardType="numeric"
                  className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
                  returnKeyType="done"
                />
              </View>
              <View className="flex-row gap-4">
                {(!!selectedActivity || !!customActivity) && (
                  <View className="self-center rounded-full bg-blue-500 px-4 py-2">
                    <View className="flex-row items-center gap-2">
                      <CheckIcon color={colors.white} width={15} height={15} />
                      <Text className="font-semibold-poppins text-sm text-white">
                        {selectedActivity || customActivity}
                      </Text>
                    </View>
                  </View>
                )}
                {(!!selectedDuration || !!customDuration) && (
                  <View
                    className="self-center rounded-full bg-blue-500 
                     px-4 py-2"
                  >
                    <View className="flex-row items-center gap-2">
                      <CheckIcon color={colors.white} width={15} height={15} />
                      <Text
                        className={`font-semibold-poppins text-sm text-white `}
                      >
                        {`${selectedDuration || customDuration} min`}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              {/* Submit Button */}
              <View className="mt-10">
                <Button
                  label="Submit"
                  withGradientBackground
                  loading={isCreateActivityLogPending}
                  disabled={isSubmitDisabled}
                  className="h-[40px]"
                  textClassName="text-white text-center text-lg font-semibold"
                  onPress={() => handleSubmit(data)}
                />
              </View>
            </ScrollView>
          </>
        );
      }}
    </Modal>
  );
});
