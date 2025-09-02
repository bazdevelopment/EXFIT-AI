/* eslint-disable max-lines-per-function */
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import CustomAlert from '@/components/custom-alert';
import HorizontalLine from '@/components/horizontal-line';
import SelectableChip from '@/components/selectable-chip';
import Toast from '@/components/toast';
import { Button, colors, Modal, Text } from '@/components/ui';
import { PlusIcon } from '@/components/ui/assets/icons';
import { MAX_DAILY_ACTIVITIES } from '@/constants/limits';
import { DEVICE_TYPE, translate } from '@/core';
import { wait } from '@/core/utilities/wait';

const WrapperInput = DEVICE_TYPE.ANDROID ? TextInput : BottomSheetTextInput;
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
  isActivitiesLimitReached: boolean;
}

interface ModalRenderProps {
  data?: ModalData;
}

interface DailyCheckInFormProps {
  data?: ModalData;
  onFormSubmit: (data: SubmitData) => void;
  isCreateActivityLogPending?: boolean;
  isActivitiesLimitReached: boolean;
}

// --- Helper Components (Unchanged) ---

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
  onFocusInput,
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
        <WrapperInput
          keyboardAppearance="dark"
          placeholder="Enter custom activity"
          onChangeText={onCustomActivityChange}
          placeholderTextColor={colors.charcoal[300]}
          className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
          returnKeyType="done"
          autoFocus
          onFocus={onFocusInput}
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
  onFocusInput,
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
      <WrapperInput
        keyboardAppearance="dark"
        maxLength={3}
        placeholder="Enter duration (minutes)"
        onChangeText={onCustomDurationChange}
        placeholderTextColor={colors.charcoal[300]}
        keyboardType="numeric"
        className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
        returnKeyType="done"
        autoFocus
        onFocus={onFocusInput}
      />
    )}
  </View>
);

// --- Stateful Form Component ---

const initialState: ComponentState = {
  activity: '',
  duration: 0,
  customActivity: '',
  customDuration: '',
  showCustomActivity: false,
  showCustomDuration: false,
};

const DailyCheckInForm: React.FC<DailyCheckInFormProps> = ({
  data,
  onFormSubmit,
  isActivitiesLimitReached,
  isCreateActivityLogPending,
}) => {
  const [state, setState] = useState<ComponentState>(initialState);

  const scrollViewRef = useRef<ScrollView>(null);

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
    setTimeout(() => {
      // Scroll to the custom activity input
      if (scrollViewRef.current && DEVICE_TYPE.ANDROID) {
        scrollViewRef.current.scrollTo({ y: 200, animated: true });
      }
    }, 100);
  }, []);

  const handleSelectCustomDuration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      duration: 0,
      showCustomDuration: true,
    }));

    setTimeout(() => {
      // Scroll to the custom duration input
      if (scrollViewRef.current && DEVICE_TYPE.ANDROID) {
        scrollViewRef.current.scrollTo({ y: 400, animated: true });
      }
    }, 100);
  }, []);

  const handleCustomActivityChange = useCallback((text: string) => {
    setState((prev) => ({ ...prev, customActivity: text }));
  }, []);

  const handleCustomDurationChange = useCallback((text: string) => {
    const sanitizedText = text.replace(/[^0-9]/g, '');
    if (Number(sanitizedText) > 360) {
      Keyboard.dismiss();
      wait(200).then(() =>
        Toast.showCustomToast(
          <CustomAlert
            title="Attention"
            subtitle={'Selected duration cannot exceed 360 minutes'}
            buttons={[
              {
                label: 'Ok',
                variant: 'default',
                onPress: Toast.dismiss,
                // a small delay in mandatory for Toast, not sure why
                buttonTextClassName: 'dark:text-white',
                className:
                  'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
              },
            ]}
          />,
          {
            duration: 10000000,
          }
        )
      );
      setState((prev) => ({ ...prev, customDuration: '' }));
      return;
    }
    setState((prev) => ({ ...prev, customDuration: sanitizedText }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (isActivitiesLimitReached) {
      return Toast.showCustomToast(
        <CustomAlert
          title={translate('general.attention')}
          subtitle={`Whoa there, champ! Are you secretly training for the Olympics? You've already hit the ${MAX_DAILY_ACTIVITIES}-activity for today! 🏅. You can flex those muscles again tomorrow 💪!`}
          buttons={[
            {
              label: 'OK',
              variant: 'default',
              onPress: Toast.dismiss,
              buttonTextClassName: 'dark:text-white',
              className:
                'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
            },
          ]}
        />,
        {
          duration: 10000000,
        }
      );
    }
    const { activity, duration, customActivity, customDuration } = state;
    onFormSubmit({
      durationMinutes: duration || parseInt(customDuration, 10) || 0,
      activityName: activity || customActivity,
      type: data?.type ?? '',
      date: data?.date ?? '',
    });
  }, [state, onFormSubmit, data]);

  const isSubmitDisabled = useMemo(() => {
    const { activity, duration, customActivity, customDuration } = state;
    const hasActivity = Boolean(activity || customActivity.trim());
    const hasDuration = duration > 0 || Boolean(customDuration.trim());
    return !(hasActivity && hasDuration);
  }, [state]);

  const Wrapper = DEVICE_TYPE.IOS ? BottomSheetScrollView : ScrollView;

  const onFocusInput = () => {
    if (scrollViewRef.current && DEVICE_TYPE.ANDROID) {
      scrollViewRef.current.scrollTo({ y: 300, animated: true });
    }
  };
  return (
    // <KeyboardAvoidingView
    //   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //   style={{ flex: 1 }}
    // >
    <Wrapper
      ref={scrollViewRef}
      className=""
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName={
        DEVICE_TYPE.ANDROID ? 'pb-[400] px-4' : 'pb-[200] px-4'
      } //!workaround to cover the entire bottom sheet with blur
    >
      <BlurView
        blurAmount={20}
        blurType="dark"
        style={StyleSheet.absoluteFill}
      />
      <ModalHeader date={data?.dateKey} />

      <ActivitySelector
        activityOptions={activityOptions}
        selectedActivity={state.activity}
        onSelectActivity={handleSelectActivity}
        onSelectCustom={handleSelectCustomActivity}
        showCustomInput={state.showCustomActivity}
        onCustomActivityChange={handleCustomActivityChange}
        onFocusInput={onFocusInput}
      />

      <DurationSelector
        durationOptions={durationOptions}
        selectedDuration={state.duration}
        onSelectDuration={handleSelectDuration}
        onSelectCustom={handleSelectCustomDuration}
        showCustomInput={state.showCustomDuration}
        onCustomDurationChange={handleCustomDurationChange}
        onFocusInput={onFocusInput}
      />

      <Button
        label="Add Activity"
        className="h-[40px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
        textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
        onPress={handleSubmit}
        disabled={isSubmitDisabled || isCreateActivityLogPending}
        loading={isCreateActivityLogPending}
      />
    </Wrapper>
    // </KeyboardAvoidingView>
  );
};

// --- Main Modal Component (Refactored) ---

export const DailyCheckInModal = React.forwardRef<any, DailyCheckInModalProps>(
  ({ onSubmit, isCreateActivityLogPending, isActivitiesLimitReached }, ref) => {
    const snapPoints = useMemo(() => ['90%', '96%'], []);

    // This handler calls the original onSubmit and then resets the form
    const handleFormSubmit = useCallback(
      (formData: SubmitData) => {
        onSubmit?.(formData);
        // resetForm(); // Reset the form after submission
      },
      [onSubmit]
    );

    return (
      <Modal
        ref={ref}
        index={0}
        // onDismiss={resetForm} // Also reset form when the modal is dismissed
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: colors.transparent,
        }}
      >
        {({ data }: ModalRenderProps = {}) => (
          // Render the stateful form content with a key to enable resets
          <DailyCheckInForm
            data={data}
            onFormSubmit={handleFormSubmit}
            isCreateActivityLogPending={isCreateActivityLogPending}
            isActivitiesLimitReached={isActivitiesLimitReached}
          />
        )}
      </Modal>
    );
  }
);
