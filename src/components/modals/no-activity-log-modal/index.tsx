/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import HorizontalLine from '@/components/horizontal-line';
import { Button, colors, Modal, Text } from '@/components/ui';
import { DeadFaceEmoji, SmileEmoji } from '@/components/ui/assets/icons';

interface NoActivityLogModalProps {
  onSubmit: ({ skipReason }: { skipReason: string }) => void; // Function to call when user skips, with optional reason
  onGoToExcuseBuster: () => void; // Function to redirect to Excuse Buster
  isCreateActivityLogPending: boolean;
}

export const NoActivityLogModal = React.forwardRef<
  BottomSheetModal,
  NoActivityLogModalProps
>(({ onSubmit, onGoToExcuseBuster, isCreateActivityLogPending }, ref) => {
  const height = 300; // Adjusted height for the new modal content
  const snapPoints = useMemo(() => [height, '75%'], [height]);
  const [skipReason, setSkipReason] = useState<string>('');
  const [showSkipReasonInput, setShowSkipReasonInput] =
    useState<boolean>(false);

  const handleSkip = () => {
    onSubmit({ skipReason });
  };
  // New: Function to reset the modal's state when it's dismissed
  const handleModalDismiss = useCallback(() => {
    setShowSkipReasonInput(false); // Hide the skip reason input
    setSkipReason(''); // Clear any previous skip reason
  }, []);
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
      <BlurView
        blurAmount={20}
        blurType="dark"
        style={[StyleSheet.absoluteFill]}
      />
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-3 mt-4">
          <Text className="font-medium-poppins text-lg text-white">
            {/* Oh no! Couch Potato Alert? */}
            Oh no! Don’t Let the couch win today!
            {/* The couch is tempting, but so is your progress! */}
          </Text>
        </View>

        {/* Motivation and Options */}
        <View className="mb-6">
          <Button
            label="Crush my excuse"
            icon={<SmileEmoji />}
            className="h-[40px] w-full gap-2 rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
            textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
            iconPosition="left"
            onPress={() => {
              onGoToExcuseBuster();
              ref.current.dismiss();
            }}
          />

          <Button
            label="Not today, maybe tomorrow..."
            icon={<DeadFaceEmoji />}
            className="h-[42px] w-full gap-3 rounded-full  border-2 border-white/40 bg-transparent active:opacity-70 disabled:bg-[#7A7A7A] dark:bg-transparent"
            textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
            iconPosition="left"
            onPress={() => {
              setShowSkipReasonInput(true);
              ref.current.expand();
            }}
          />

          {showSkipReasonInput && (
            <>
              <HorizontalLine className="my-5" />
              <View>
                <Text className="font-medium-poppins text-lg text-white">
                  That’s okay, just checking in.
                </Text>
                <Text className="my-2 font-medium-poppins text-sm text-white">
                  Want to share why today didn’t work out? No pressure.
                </Text>
                <BottomSheetTextInput
                  keyboardAppearance="dark"
                  value={skipReason}
                  maxLength={200}
                  onChangeText={setSkipReason}
                  placeholder="E.g. My cat ate my running shoes"
                  placeholderTextColor={colors.charcoal[300]}
                  className="my-3 h-[48px] rounded-xl border border-gray-600 bg-[#37393F] px-2 pb-1 text-base text-white"
                  returnKeyType="done"
                />
                <Button
                  label="Skip today"
                  onPress={handleSkip}
                  loading={isCreateActivityLogPending}
                  className="mt-4 h-[44px] rounded-full disabled:bg-gray-500 disabled:opacity-60" // Red for skipping
                  textClassName="text-white text-center text-base font-primary-poppins"
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
});
