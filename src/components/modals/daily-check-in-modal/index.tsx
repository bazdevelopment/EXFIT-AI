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
import CustomBottomSheetButton from '@/components/custom-bottom-sheet-button';
import HorizontalLine from '@/components/horizontal-line';
import SelectableChip from '@/components/selectable-chip';
import Toast from '@/components/toast';
import { colors, Modal, Text } from '@/components/ui';
import { PlusIcon } from '@/components/ui/assets/icons';
import { MAX_DAILY_ACTIVITIES } from '@/constants/limits';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
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

const ModalHeader: React.FC<ModalHeaderProps> = ({ date }) => {
  const { language } = useSelectedLanguage();

  return (
    <>
      <Text className="mt-2 font-bold-poppins text-lg text-white">
        {dayjs(date).locale(language).format('dddd, MMMM D')}
      </Text>
      <View className="mt-2">
        <Text className="font-medium-poppins text-base text-white">
          {translate('components.DailyCheckInForm.modalHeading')}
        </Text>
      </View>
      <HorizontalLine className="my-5" />
    </>
  );
};

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
      {translate('components.ActivitySelector.title')}
    </Text>
    <View className="flex-row flex-wrap">
      {activityOptions.map((activity) => (
        <SelectableChip
          key={activity.id}
          title={activity.label}
          isSelected={selectedActivity === activity.label}
          className="border border-gray-600"
          onPress={() => onSelectActivity(activity.label)}
          style={{
            borderWidth: 1,
            borderColor: colors.charcoal[600],
          }}
        />
      ))}
      <SelectableChip
        icon={<PlusIcon />}
        title={translate('components.ActivitySelector.customActivityLabel')}
        isSelected={showCustomInput}
        className="border border-gray-600"
        style={{
          borderWidth: 1,
          borderColor: colors.charcoal[600],
        }}
        onPress={onSelectCustom}
      />
    </View>
    {showCustomInput && (
      <View className="mt-4">
        <WrapperInput
          keyboardAppearance="dark"
          placeholder={translate('components.ActivitySelector.customActivity')}
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
      {translate('components.DurationSelector.heading')}
    </Text>
    <View className="mb-4 flex-row flex-wrap">
      {durationOptions.map((duration) => (
        <SelectableChip
          key={duration.id}
          title={duration.label}
          isSelected={selectedDuration === duration.value}
          className="mb-2 mr-2 border border-gray-600"
          style={{
            borderWidth: 1,
            borderColor: colors.charcoal[600],
          }}
          onPress={() => onSelectDuration(duration.value)}
        />
      ))}
      <SelectableChip
        icon={<PlusIcon />}
        title={translate('components.DurationSelector.customDurationLabel')}
        isSelected={showCustomInput}
        className="border border-gray-600"
        style={{
          borderWidth: 1,
          borderColor: colors.charcoal[600],
        }}
        onPress={onSelectCustom}
      />
    </View>
    {showCustomInput && (
      <WrapperInput
        keyboardAppearance="dark"
        maxLength={3}
        placeholder={translate('components.DurationSelector.customDuration')}
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
      { id: 'gym', label: translate('activities.gym') },
      { id: 'yoga', label: translate('activities.yoga') },
      { id: 'running', label: translate('activities.running') },
      { id: 'walking', label: translate('activities.walking') },
      { id: 'cycling', label: translate('activities.cycling') },
      { id: 'dance', label: translate('activities.dance') },
      { id: 'stretching', label: translate('activities.stretching') },
      { id: 'swimming', label: translate('activities.swimming') },
      { id: 'hiking', label: translate('activities.hiking') },
      { id: 'pilates', label: translate('activities.pilates') },
      { id: 'climbing', label: translate('activities.climbing') },
      { id: 'skating', label: translate('activities.skating') },
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
        scrollViewRef.current.scrollTo({ y: 100, animated: true });
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
        scrollViewRef.current.scrollTo({ y: 300, animated: true });
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
            title={translate('general.attention')}
            subtitle={translate('components.DailyCheckInForm.durationLonger')}
            buttons={[
              {
                label: translate('general.ok'),
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
          subtitle={translate('components.DailyCheckInForm.activitiesLimit', {
            MAX_DAILY_ACTIVITIES,
          })}
          buttons={[
            {
              label: translate('general.ok'),
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

      {/* <Button
        label="Add Activity"
        className="h-[40px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
        textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
        onPress={handleSubmit}
        disabled={isSubmitDisabled || isCreateActivityLogPending}
        loading={isCreateActivityLogPending}
      /> */}
      <CustomBottomSheetButton
        onPress={handleSubmit}
        loading={isCreateActivityLogPending}
        disabled={isSubmitDisabled || isCreateActivityLogPending}
        label={translate('components.DailyCheckInForm.addActivity')}
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
