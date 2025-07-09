/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import GradientText from '@/components/gradient-text';
import { Button, colors, Modal, Text } from '@/components/ui';

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
  }, []); // Memoize this function, as it doesn't depend on props or state

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
        <View className="mb-6 mt-2">
          <GradientText colors={['#0482f8', '#3195FD']} className="mt-2">
            <Text className="text-center font-bold-poppins text-2xl text-white">
              {/* Oh no! Couch Potato Alert? */}
              Oh no! Don’t Let the Couch Win!
            </Text>
          </GradientText>

          <Text className="mt-2 text-center font-semibold-poppins text-base text-white">
            {/* Your body is itching for some action! Let's get moving, even just a
            little. */}
            {/* Small moves lead to big victories—let’s start now! */}
            Face Yourself. Beat Yourself. Go!
          </Text>
        </View>

        {/* Motivation and Options */}
        <View className="mb-6">
          {/* <Text className="mb-4 font-bold-poppins text-lg text-white">
            Feeling stuck? Let's get your body moving!
          </Text> */}

          {/* <Button
            label="Spark my inspiration! ✨"
            onPress={onSuggestActivity}
            withGradientBackground
            className="h-[32px]"
            textClassName="text-white text-center text-lg font-semibold-poppins"
          /> */}

          {/* <View className="self-center w-[80%]"> */}
          <Button
            label="Crush my excuse! 💪"
            withGradientBackground
            onPress={() => {
              onGoToExcuseBuster();
              ref.current.dismiss();
            }}
            className="h-[32px] self-center" // Example color for excuse buster
            textClassName="text-white text-center font-bold-poppins"
          />
          {/* </View> */}

          <TouchableOpacity
            onPress={() => {
              setShowSkipReasonInput(true);
              ref.current.expand();
            }}
            className="py-3"
          >
            <Text className="text-center font-semibold-poppins text-base text-white underline">
              Not today, maybe tomorrow...
            </Text>
          </TouchableOpacity>

          {showSkipReasonInput && (
            <View className="mt-4">
              <Text className="mb-2 font-semibold-poppins text-base text-white">
                No worries! But just curios, why the skip? (No judgment!)
              </Text>
              <BottomSheetTextInput
                keyboardAppearance="dark"
                value={skipReason}
                maxLength={200}
                onChangeText={setSkipReason}
                placeholder="E.g., My cat ate my running shoes, busy saving the world, etc."
                placeholderTextColor={colors.charcoal[300]}
                className="rounded-xl border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white"
                returnKeyType="done"
              />
              <Button
                label="Okay, I'll skip (for now)"
                variant="destructive"
                onPress={handleSkip}
                loading={isCreateActivityLogPending}
                className="mt-4 h-[40px] bg-red-600 disabled:bg-danger-600 disabled:opacity-60" // Red for skipping
                textClassName="text-white text-center text-base font-bold-poppins"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
});
