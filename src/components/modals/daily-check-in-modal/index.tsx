/* eslint-disable max-lines-per-function */
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import HorizontalLine from '@/components/horizontal-line';
import SelectableChip from '@/components/selectable-chip';
import { Button, colors, Modal, Text } from '@/components/ui';
import { PlusIcon } from '@/components/ui/assets/icons';

// --- TypeScript Interfaces ---

interface ActivityOption {
  id: string;
  label: string;
}

interface DurationOption {
  id: string;
  value: number;
  label: string;
}

interface ModalData {
  dateKey?: string;
  type?: string;
  date?: string;
}

interface SubmitData {
  durationMinutes: number;
  activityName: string;
  type: string;
  date: string;
}

interface ComponentState {
  activity: string;
  duration: number;
  customActivity: string;
  customDuration: string;
  showCustomActivity: boolean;
  showCustomDuration: boolean;
}

interface ModalHeaderProps {
  date?: string;
}

interface ActivitySelectorProps {
  activityOptions: ActivityOption[];
  selectedActivity: string;
  onSelectActivity: (activity: string) => void;
  onSelectCustom: () => void;
  showCustomInput: boolean;
  onCustomActivityChange: (text: string) => void;
}

interface DurationSelectorProps {
  durationOptions: DurationOption[];
  selectedDuration: number;
  onSelectDuration: (duration: number) => void;
  onSelectCustom: () => void;
  showCustomInput: boolean;
  onCustomDurationChange: (text: string) => void;
}

interface DailyCheckInModalProps {
  onSubmit?: (data: SubmitData) => void;
  isCreateActivityLogPending?: boolean;
}

interface ModalRenderProps {
  data?: ModalData;
}

// --- Helper Components ---

const ModalHeader: React.FC<ModalHeaderProps> = ({ date }) => (
  <>
    <Text className="mt-2 font-bold-poppins text-lg text-white">
      {dayjs(date).format('dddd, MMMM D')}
    </Text>
    <View className="mt-2">
      <Text className="font-medium-poppins text-base text-white">
        What got you moving today? Log it to keep your momentum strong.
      </Text>
    </View>
    <HorizontalLine className="my-5" />
  </>
);

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activityOptions,
  selectedActivity,
  onSelectActivity,
  onSelectCustom,
  showCustomInput,
  onCustomActivityChange,
}) => (
  <>
    <Text className="mb-4 font-semibold-poppins text-lg text-white">
      Activity Type
    </Text>
    <View className="flex-row flex-wrap">
      {activityOptions.map((activity) => (
        <SelectableChip
          key={activity.id}
          title={activity.label}
          isSelected={selectedActivity === activity.label}
          className="border border-gray-600"
          onPress={() => onSelectActivity(activity.label)}
        />
      ))}
      <SelectableChip
        icon={<PlusIcon />}
        title="Custom Activity"
        isSelected={showCustomInput}
        className="border border-gray-600"
        onPress={onSelectCustom}
      />
    </View>
    {showCustomInput && (
      <View className="mt-4">
        <BottomSheetTextInput
          keyboardAppearance="dark"
          placeholder="Enter custom activity"
          onChangeText={onCustomActivityChange}
          placeholderTextColor={colors.charcoal[300]}
          className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
          returnKeyType="done"
          autoFocus
        />
      </View>
    )}
    <HorizontalLine className="my-4" />
  </>
);

const DurationSelector: React.FC<DurationSelectorProps> = ({
  durationOptions,
  selectedDuration,
  onSelectDuration,
  onSelectCustom,
  showCustomInput,
  onCustomDurationChange,
}) => (
  <View className="mb-4">
    <Text className="mb-4 font-semibold-poppins text-lg text-white">
      Duration
    </Text>
    <View className="mb-4 flex-row flex-wrap">
      {durationOptions.map((duration) => (
        <SelectableChip
          key={duration.id}
          title={duration.label}
          isSelected={selectedDuration === duration.value}
          className="mb-2 mr-2 border border-gray-600"
          onPress={() => onSelectDuration(duration.value)}
        />
      ))}
      <SelectableChip
        icon={<PlusIcon />}
        title="Custom Duration"
        isSelected={showCustomInput}
        className="border border-gray-600"
        onPress={onSelectCustom}
      />
    </View>
    {showCustomInput && (
      <BottomSheetTextInput
        keyboardAppearance="dark"
        maxLength={3}
        placeholder="Enter duration (minutes)"
        onChangeText={onCustomDurationChange}
        placeholderTextColor={colors.charcoal[300]}
        keyboardType="numeric"
        className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
        returnKeyType="done"
        autoFocus
      />
    )}
  </View>
);

// --- Main Component ---

const initialState: ComponentState = {
  activity: '',
  duration: 0,
  customActivity: '',
  customDuration: '',
  showCustomActivity: false,
  showCustomDuration: false,
};

export const DailyCheckInModal = React.forwardRef<any, DailyCheckInModalProps>(
  ({ onSubmit, isCreateActivityLogPending }, ref) => {
    const [state, setState] = useState<ComponentState>(initialState);

    const snapPoints = useMemo(() => ['85%', '92%'], []);

    const activityOptions = useMemo<ActivityOption[]>(
      () => [
        { id: 'gym', label: 'Gym' },
        { id: 'yoga', label: 'Yoga' },
        { id: 'running', label: 'Running' },
        { id: 'walking', label: 'Walking' },
        { id: 'cycling', label: 'Cycling' },
        { id: 'dance', label: 'Dance' },
        { id: 'stretching', label: 'Stretching' },
        { id: 'swimming', label: 'Swimming' },
        { id: 'hiking', label: 'Hiking' },
        { id: 'pilates', label: 'Pilates' },
        { id: 'climbing', label: 'Climbing' },
        { id: 'skating', label: 'Skating' },
      ],
      []
    );

    const durationOptions = useMemo<DurationOption[]>(
      () => [
        { id: '10min', value: 10, label: '10 min' },
        { id: '15min', value: 15, label: '15 min' },
        { id: '20min', value: 20, label: '20 min' },
        { id: '30min', value: 30, label: '30 min' },
        { id: '45min', value: 45, label: '45 min' },
        { id: '60min', value: 60, label: '60 min' },
        { id: '90min', value: 90, label: '90 min' },
        { id: '120min', value: 120, label: '120 min' },
      ],
      []
    );

    const resetState = useCallback(() => setState(initialState), []);

    const handleSelectActivity = useCallback((activity: string) => {
      setState((prev) => ({
        ...prev,
        activity: prev.activity === activity ? '' : activity,
        showCustomActivity: false,
        customActivity: '',
      }));
    }, []);

    const handleSelectDuration = useCallback((duration: number) => {
      setState((prev) => ({
        ...prev,
        duration: prev.duration === duration ? 0 : duration,
        showCustomDuration: false,
        customDuration: '',
      }));
    }, []);

    const handleSelectCustomActivity = useCallback(() => {
      setState((prev) => ({
        ...prev,
        activity: '',
        showCustomActivity: true,
      }));
    }, []);

    const handleSelectCustomDuration = useCallback(() => {
      setState((prev) => ({
        ...prev,
        duration: 0,
        showCustomDuration: true,
      }));
    }, []);

    const handleCustomActivityChange = useCallback((text: string) => {
      setState((prev) => ({ ...prev, customActivity: text }));
    }, []);

    const handleCustomDurationChange = useCallback((text: string) => {
      const sanitizedText = text.replace(/[^0-9]/g, '');

      if (Number(sanitizedText) > 360) {
        alert('Selected duration cannot exceed 360 minutes');
        // Option 1: Clear the input completely
        setState((prev) => ({ ...prev, customDuration: '' }));

        // Option 2: Keep only the first 2 digits (uncomment this and comment out option 1)
        // setState((prev) => ({ ...prev, customDuration: sanitizedText.slice(0, 2) }));

        return;
      }

      setState((prev) => ({ ...prev, customDuration: sanitizedText }));
    }, []);

    const handleSubmit = useCallback(
      (data?: ModalData) => {
        const { activity, duration, customActivity, customDuration } = state;

        // Submit the data
        onSubmit?.({
          durationMinutes: duration || parseInt(customDuration, 10) || 0,
          activityName: activity || customActivity,
          type: data?.type ?? '',
          date: data?.date ?? '',
        });

        // Reset the form after submission
        resetState();
      },
      [state, onSubmit, resetState]
    );

    const isSubmitDisabled = useMemo(() => {
      const { activity, duration, customActivity, customDuration } = state;
      const hasActivity = Boolean(activity || customActivity.trim());
      const hasDuration = duration > 0 || Boolean(customDuration.trim());
      return !(hasActivity && hasDuration);
    }, [state]);

    return (
      <Modal
        ref={ref}
        index={0}
        onDismiss={resetState}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: colors.transparent }}
      >
        {({ data }: ModalRenderProps = {}) => (
          <>
            <BlurView
              blurAmount={20}
              blurType="dark"
              style={StyleSheet.absoluteFill}
            />
            <ScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <ModalHeader date={data?.dateKey} />

              <ActivitySelector
                activityOptions={activityOptions}
                selectedActivity={state.activity}
                onSelectActivity={handleSelectActivity}
                onSelectCustom={handleSelectCustomActivity}
                showCustomInput={state.showCustomActivity}
                onCustomActivityChange={handleCustomActivityChange}
              />

              <DurationSelector
                durationOptions={durationOptions}
                selectedDuration={state.duration}
                onSelectDuration={handleSelectDuration}
                onSelectCustom={handleSelectCustomDuration}
                showCustomInput={state.showCustomDuration}
                onCustomDurationChange={handleCustomDurationChange}
              />

              <Button
                label="Add Activity"
                className="h-[40px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
                onPress={() => handleSubmit(data)}
                disabled={isSubmitDisabled || isCreateActivityLogPending}
                loading={isCreateActivityLogPending}
              />
            </ScrollView>
          </>
        )}
      </Modal>
    );
  }
);
