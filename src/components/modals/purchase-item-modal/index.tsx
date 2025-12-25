/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import LottieView from 'lottie-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { usePurchaseShopItem } from '@/api/shop/shop.hooks';
import { Button, colors, Image, Modal } from '@/components/ui';
import { GemIcon } from '@/components/ui/assets/icons';
import { translate } from '@/core';

interface PurchaseItemModalProps {
  onCloseModal: () => void;
  currentGemBalance: number;
}

export const PurchaseItemModal = React.forwardRef<
  BottomSheetModal,
  PurchaseItemModalProps
>(({ onCloseModal, currentGemBalance }, ref) => {
  const height = 450;
  const snapPoints = useMemo(() => [height, '75%'], [height]);

  const {
    mutate: onPurchaseShopItem,
    isSuccess,
    isError,
    isPending,
    reset,
  } = usePurchaseShopItem();
  return (
    <Modal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      onDismiss={reset}
      backgroundStyle={{
        backgroundColor: colors.transparent,
      }}
    >
      {({ data }) => {
        if (isSuccess) {
          // Success state - show congratulations
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
                <View className="mt-14 flex-1 items-center justify-center">
                  {/* Celebration Animation */}
                  <View className="mb-8 mt-2 items-center justify-center">
                    <View className="z-10 size-20 items-center justify-center rounded-full">
                      <LottieView
                        source={require('assets/lottie/congratulations.json')}
                        autoPlay
                        loop={false}
                        style={{
                          width: 200,
                          height: 200,
                          alignSelf: 'center',
                        }}
                      />
                    </View>
                  </View>

                  {/* Success Title */}
                  <Text className="mb-3 mt-2 text-center font-semibold-poppins text-2xl text-white">
                    {translate('components.PurchaseItemModal.purchaseComplete')}
                  </Text>

                  {/* Success Subtitle */}
                  <Text className="mb-5 px-5 text-center font-primary-poppins text-base leading-5 text-white">
                    {data.name}{' '}
                    {translate('components.PurchaseItemModal.inventoryAdded')}
                  </Text>

                  {/* Continue Button */}
                  <Button
                    label={translate('general.continue')}
                    className="h-[50px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                    textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
                    onPress={onCloseModal}
                  />
                </View>
              </BottomSheetScrollView>
            </>
          );
        }

        if (isError) {
          // Error state - show error message
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
                <View className="flex-1 items-center justify-center">
                  {/* Error Icon */}
                  <View className="mb-8 mt-6 items-center justify-center">
                    <View className="size-16 items-center justify-center rounded-full bg-red-500/20">
                      <Text className="text-3xl">❌</Text>
                    </View>
                  </View>

                  {/* Error Title */}
                  <Text className="mb-3 mt-2 text-center font-semibold-poppins text-2xl text-white">
                    {translate('components.PurchaseItemModal.purchaseFailed')}
                  </Text>

                  {/* Error Subtitle */}
                  <Text className="mb-5 px-5 text-center font-primary-poppins text-base leading-5 text-gray-300">
                    {translate(
                      'components.PurchaseItemModal.purchaseFailedMessage'
                    )}
                  </Text>

                  {/* Action Buttons */}
                  <View className="w-full space-y-3">
                    <Button
                      label={translate('general.tryAgain')}
                      className="h-[50px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                      textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
                      onPress={() =>
                        onPurchaseShopItem({ itemId: data.id, quantity: 1 })
                      }
                    />
                    <Button
                      label={translate('general.cancel')}
                      className="h-[50px] w-full rounded-full border border-gray-500 bg-transparent"
                      textClassName="text-white font-medium-poppins text-base"
                      onPress={onCloseModal}
                    />
                  </View>
                </View>
              </ScrollView>
            </>
          );
        }

        // Purchase confirmation state
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
              <View className="mt-6 flex-1 items-center justify-center">
                {/* Item Image */}
                <View className="mb-6 size-24 items-center justify-center">
                  <Image
                    source={{ uri: data.imageUrl }}
                    className="size-full rounded-xl"
                  />
                </View>

                {/* Item Name */}
                <Text className="mb-4 text-center font-semibold-poppins text-xl text-white">
                  {data.name}
                </Text>

                {/* Item Description */}
                <Text className="mb-6 px-4 text-center font-primary-poppins text-sm leading-5 text-gray-300">
                  {data.description}
                </Text>

                {/* Price Display */}
                <View className="mb-8 flex-row items-center justify-center">
                  <View className="mr-2 size-6 items-center justify-center">
                    <GemIcon width={20} height={20} />
                  </View>
                  <Text className="font-semibold-poppins text-lg text-white">
                    {data.costInGems} gems
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="w-full flex-row gap-4">
                  {/* <Button
                    label="Cancel"
                    className="h-14 flex-1 rounded-full border border-gray-500 bg-transparent"
                    textClassName="text-white font-medium-poppins text-base"
                    onPress={onCloseModal}
                  /> */}

                  <Button
                    loading={isPending}
                    disabled={currentGemBalance < data.costInGems}
                    label={
                      currentGemBalance < data.costInGems
                        ? translate('components.PurchaseItemModal.gemsBalance')
                        : translate('general.purchase')
                    }
                    // icon={<GemIcon width={20} height={20} />}
                    className="h-14 flex-1 rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                    textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base text-center"
                    onPress={() =>
                      onPurchaseShopItem({ itemId: data.id, quantity: 1 })
                    }
                  />
                </View>
              </View>
            </ScrollView>
          </>
        );
      }}
    </Modal>
  );
});
