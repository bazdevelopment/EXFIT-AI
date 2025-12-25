/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import HorizontalLine from '@/components/horizontal-line';
import { Button, colors, Modal, Text } from '@/components/ui';
import { DeadFaceEmoji, SmileEmoji } from '@/components/ui/assets/icons';
import { DEVICE_TYPE, translate } from '@/core';

interface SkipReasonInputProps {
  onSubmit: (skipReason: string) => void;
  isLoading: boolean;
}

const SkipReasonInput: React.FC<SkipReasonInputProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [skipReason, setSkipReason] = useState<string>('');

  const handleSubmit = useCallback(() => {
    onSubmit(skipReason);
  }, [skipReason, onSubmit]);

  return (
    <>
      <HorizontalLine className="my-5" />
      <View>
        <Text className="font-medium-poppins text-lg text-white">
          {translate('components.SkipReasonInput.title')}
        </Text>
        <Text className="my-2 font-medium-poppins text-sm text-white">
          {translate('components.SkipReasonInput.subtitle')}
        </Text>
        <BottomSheetTextInput
          keyboardAppearance="dark"
          value={skipReason}
          maxLength={300}
          onChangeText={setSkipReason}
          placeholder={translate('components.SkipReasonInput.skipPlaceholder')}
          placeholderTextColor={colors.charcoal[300]}
          className="my-3 h-[48px] rounded-xl border border-gray-600 bg-[#37393F] px-2 pb-1 text-base text-white"
          returnKeyType="done"
        />
        <Button
          label={translate('components.SkipReasonInput.skipToday')}
          onPress={handleSubmit}
          loading={isLoading}
          className="mt-4 h-[44px] rounded-full disabled:bg-gray-500 disabled:opacity-60"
          textClassName="text-white text-center text-base font-primary-poppins"
        />
      </View>
    </>
  );
};

interface NoActivityLogModalProps {
  onSubmit: ({ skipReason }: { skipReason: string }) => void;
  onGoToExcuseBuster: () => void;
  isCreateActivityLogPending: boolean;
}

export const NoActivityLogModal = React.forwardRef<
  BottomSheetModal,
  NoActivityLogModalProps
>(({ onSubmit, onGoToExcuseBuster, isCreateActivityLogPending }, ref) => {
  const height = 300;
  const snapPoints = useMemo(() => [height, '70%'], [height]);
  const [showSkipReasonInput, setShowSkipReasonInput] =
    useState<boolean>(false);

  const handleSkipReasonSubmit = useCallback(
    (skipReason: string) => {
      onSubmit({ skipReason });
    },
    [onSubmit]
  );

  const handleModalDismiss = useCallback(() => {
    setShowSkipReasonInput(false);
  }, []);

  const handleExcuseBuster = useCallback(() => {
    onGoToExcuseBuster();
    ref.current?.dismiss();
  }, [onGoToExcuseBuster, ref]);

  const handleShowSkipInput = useCallback(() => {
    setShowSkipReasonInput(true);
    ref.current?.expand();
  }, [ref]);

  const Wrapper = DEVICE_TYPE.IOS ? React.Fragment : BottomSheetView;

  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      onDismiss={handleModalDismiss}
      backgroundStyle={{
        backgroundColor: colors.transparent,
      }}
    >
      <Wrapper>
        <BlurView
          blurAmount={20}
          blurType="dark"
          style={[StyleSheet.absoluteFill]}
        />
        <BottomSheetScrollView
          className="px-4"
          contentContainerClassName={DEVICE_TYPE.ANDROID ? 'pb-[500px]' : ''}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-3 mt-4">
            <Text className="font-medium-poppins text-lg text-white">
              {translate('components.NoActivityLogModal.heading')}
            </Text>
          </View>

          {/* Motivation and Options */}
          <View className="mb-6">
            <Button
              label={translate('components.NoActivityLogModal.crushExcuse')}
              icon={<SmileEmoji />}
              className="h-[40px] w-full gap-2 rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
              textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
              iconPosition="left"
              onPress={handleExcuseBuster}
            />

            <Button
              label={translate('components.NoActivityLogModal.skipToday')}
              icon={<DeadFaceEmoji />}
              className="h-[42px] w-full gap-3 rounded-full border-2 border-white/40 bg-transparent active:opacity-70 disabled:bg-[#7A7A7A] dark:bg-transparent"
              textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
              iconPosition="left"
              onPress={handleShowSkipInput}
            />

            {showSkipReasonInput && (
              <SkipReasonInput
                onSubmit={handleSkipReasonSubmit}
                isLoading={isCreateActivityLogPending}
              />
            )}
          </View>
        </BottomSheetScrollView>
      </Wrapper>
    </Modal>
  );
});
