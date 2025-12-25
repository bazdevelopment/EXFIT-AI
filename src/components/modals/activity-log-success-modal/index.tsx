/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, colors, Modal } from '@/components/ui';
import { FlashIcon, GemIcon } from '@/components/ui/assets/icons';
import { translate } from '@/core';

interface ActivityLogSuccessModalProps {
  onCloseModal: () => void;
}

export const ActivityLogSuccessModal = React.forwardRef<
  BottomSheetModal,
  ActivityLogSuccessModalProps
>(({ onCloseModal }, ref) => {
  const height = 450; // Adjusted height for the success modal content
  const snapPoints = useMemo(() => [height, '75%'], [height]);

  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: colors.transparent,
      }}
    >
      {({ data }) => {
        const { gemsReward, xpReward } = data;
        return (
          <>
            <BlurView
              blurAmount={20}
              blurType="dark"
              style={[StyleSheet.absoluteFill]}
            />
            <BottomSheetScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
            >
              <View className="mt-6 flex-1 items-center justify-center">
                {/* Celebration Icon */}
                <View className="mb-8 mt-2 items-center justify-center">
                  <View className="z-10 size-20 items-center justify-center rounded-full">
                    <LottieView
                      source={require('assets/lottie/congratulations.json')}
                      autoPlay
                      loop={false}
                      style={{ width: 200, height: 200, alignSelf: 'center' }}
                    />
                  </View>
                </View>

                {/* Title */}
                <Text className="mb-3 mt-2 text-center font-semibold-poppins text-2xl text-white">
                  {translate('components.ActivityLogSuccessModal.heading')}
                </Text>

                {/* Subtitle */}
                <Text className="mb-5 px-5 text-center font-primary-poppins text-base leading-5 text-white">
                  {/* You did it! One activity down, and you’ve unlocked your
                  reward. Let’s keep the streak going! */}
                  {translate('components.ActivityLogSuccessModal.unlockReward')}
                </Text>

                {/* Rewards */}
                <View className="mb-6 w-full flex-row justify-around px-10">
                  <View className="flex-1 items-center">
                    <View className="mb-2 size-8 items-center justify-center">
                      <GemIcon width={22} height={22} />
                    </View>
                    <Text className="text-base font-semibold text-white">
                      {`${gemsReward} gems`}
                    </Text>
                  </View>

                  <View className="flex-1 items-center">
                    <View className="mb-2 size-8 items-center justify-center">
                      <FlashIcon width={22} height={22} />
                    </View>
                    <Text className="text-base font-semibold text-white">
                      {`${xpReward} XP`}
                    </Text>
                  </View>
                </View>

                <Button
                  label={translate('general.goBack')}
                  className="h-[40px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                  textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
                  onPress={onCloseModal}
                />
              </View>
            </BottomSheetScrollView>
          </>
        );
      }}
    </Modal>
  );
});
