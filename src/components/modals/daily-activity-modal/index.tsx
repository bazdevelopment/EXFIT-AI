/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { router } from 'expo-router';
import { GAMIFICATION_REWARDS_CONFIG } from 'functions/utilities/rewards-pricing';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ActivitiesList from '@/components/activities-list';
import CustomAlert from '@/components/custom-alert';
import StreakWarning from '@/components/streak-warning';
import Toast from '@/components/toast';
import { Image, Modal, Text } from '@/components/ui';
import { FlashIcon, GemIcon } from '@/components/ui/assets/icons';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import { checkIsToday } from '@/core/utilities/date-time-helpers';

import dayjs from '../../../lib/dayjs';

interface DailyActivityModalProps {
  onAddActivity: (date: string) => void;
  onRepairStreak: () => void;
  isRepairStreakPending: boolean;
  hasUserRepairStreakElixir: boolean;
}

export const DailyActivityModal = React.forwardRef<
  BottomSheetModal,
  DailyActivityModalProps
>(
  (
    {
      onAddActivity,
      onRepairStreak,
      onAddNotes,
      isRepairStreakPending,
      hasUserRepairStreakElixir,
      currentWeekActivityLogs,
    },
    ref
  ) => {
    const height = 550;
    const snapPoints = useMemo(() => [height, '90%'], [height]);
    const { language } = useSelectedLanguage();
    const elixirPrice =
      GAMIFICATION_REWARDS_CONFIG.shopItems.STREAK_REVIVAL_ELIXIR.costInGems;

    const handleRepairStreak = (lostStreakValue: number) => {
      if (!hasUserRepairStreakElixir) {
        Toast.showCustomToast(
          <CustomAlert
            visible
            image={
              <Image
                source={require('../../ui/assets/images/shop/streak-revival-elixir.png')}
                className="size-[80]"
              />
            }
            title={translate('components.DailyActivityModal.streakBroken')}
            subtitle={translate(
              'components.DailyActivityModal.buyRepairStreak',
              { elixirPrice }
            )}
            buttons={[
              {
                label: translate('components.DailyActivityModal.loseStreak'),
                variant: '',
                onPress: () => Toast.dismiss(),
                className:
                  'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
                buttonTextClassName: 'text-white dark:text-white text-sm',
              },
              {
                label: translate('components.DailyActivityModal.buyStreak'),
                variant: '',
                onPress: () => {
                  // router.navigate('/shop');
                  router.push({
                    pathname: `/shop`,
                    params: { displayProductName: 'STREAK_REVIVAL_ELIXIR' },
                  });
                  ref.current.dismiss();
                },
                buttonTextClassName:
                  'text-white dark:text-white text-sm text-center',
                className:
                  'flex-1 rounded-full h-[48] bg-[#4E52FB] dark:bg-[#4E52FB] active:opacity-80',
              },
            ]}
          />,
          {
            duration: 10000000,
          }
        );
        return;
      }

      Toast.showCustomToast(
        <CustomAlert
          visible
          image={
            <Image
              source={require('../../ui/assets/images/shop/streak-revival-elixir.png')}
              className="size-[80]"
            />
          }
          title={translate('components.DailyActivityModal.streakRestore')}
          subtitle={translate(
            'components.DailyActivityModal.restorationStreak',
            {
              lostStreakValue,
            }
          )}
          buttons={[
            {
              label: translate('components.DailyActivityModal.loseStreak'),
              variant: '',
              onPress: () => Toast.dismiss(),
              className:
                'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
              buttonTextClassName: 'text-white dark:text-white text-sm',
            },
            {
              label: translate('components.DailyActivityModal.applyElixir'),
              variant: '',
              onPress: onRepairStreak,
              buttonTextClassName:
                'text-white dark:text-white text-sm text-center',
              className:
                'flex-1 rounded-full h-[48] bg-[#4E52FB] dark:bg-[#4E52FB] active:opacity-80',
            },
          ]}
        />,
        {
          duration: 10000000,
        }
      );
    };

    const Wrapper = DEVICE_TYPE.IOS ? React.Fragment : BottomSheetView;

    return (
      <Modal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: 'transparent',
        }}
      >
        {({ data }) => {
          const { dateKey } = data;
          const record = currentWeekActivityLogs[dateKey][0];
          const activities = record.activities;
          const totalXP =
            activities?.reduce((sum, activity) => sum + activity.xpEarned, 0) ||
            0;
          const totalGems =
            activities?.reduce(
              (sum, activity) => sum + activity.gemsEarned,
              0
            ) || 0;

          return (
            <Wrapper>
              <BlurView
                blurAmount={30}
                blurType="dark"
                style={[StyleSheet.absoluteFill]}
              />
              {/* <BottomSheetScrollView
                className="flex-1 px-4 pt-6"
                contentContainerClassName="mb-[200]"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              > */}
              {/* //!very important to use BottomSheetScrollView to trigger on drag gesture (up and bottom)*/}
              <BottomSheetScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                className="flex-1 px-4 pt-6"
                contentContainerClassName={
                  DEVICE_TYPE.ANDROID ? 'pb-[500px]' : ''
                }
              >
                {/* <KeyboardAwareScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerClassName="mb-[200]"
                  className="flex-1 px-4 pt-6"
                > */}
                {/* Header with Date */}
                <View className="mb-6 items-center">
                  {/* Day Number */}

                  {/* Title and Date */}
                  <Text className="mb-4 mt-[-10px] font-bold-poppins text-xl text-white">
                    {dayjs(data.dateKey)
                      .locale(language)
                      .format('dddd, MMMM D')}
                  </Text>
                  <StreakWarning
                    isStreakReset={record?.isStreakReset}
                    isStreakFreezeUsed={record?.isStreakFreezeUsed}
                    isStreakRepaired={record?.isStreakRepaired}
                    isElixirUsageExpired={record?.isElixirUsageExpired}
                    onRepairStreak={() =>
                      handleRepairStreak(record?.lostStreakValue)
                    }
                    isRepairStreakPending={false}
                  />

                  {/* Stats */}
                  <View className="flex-row gap-8">
                    <View className="items-center">
                      <View className="mb-2 size-10 items-center justify-center rounded-full bg-purple-500/20">
                        <FlashIcon width={20} height={20} />
                      </View>
                      <Text className="font-bold-poppins text-lg text-orange-400 dark:text-orange-400">
                        {totalXP}
                      </Text>
                      <Text className="font-medium-poppins text-sm text-white">
                        XP
                      </Text>
                    </View>
                    <View className="items-center">
                      <View className="mb-2 size-10 items-center justify-center rounded-full bg-yellow-500/20">
                        <GemIcon width={20} height={20} />
                      </View>
                      <Text className="font-bold-poppins text-lg text-blue-300 dark:text-blue-300">
                        {totalGems}
                      </Text>
                      <Text className="font-medium-poppins text-sm text-white">
                        Gems
                      </Text>
                    </View>
                    <View className="items-center">
                      <View className="mb-2 size-10 items-center justify-center rounded-full bg-green-500/20">
                        <Text className="text-lg">🎯</Text>
                      </View>
                      <Text className="font-bold-poppins text-lg text-green-400 dark:text-green-400">
                        {activities?.length || 0}
                      </Text>
                      <Text className="font-medium-poppins text-sm text-white">
                        {translate('general.activities')}
                      </Text>
                    </View>
                  </View>
                </View>

                <ActivitiesList
                  showInModal
                  activities={activities}
                  onAddActivity={() => onAddActivity(dateKey)}
                  isToday={checkIsToday(dateKey, language)}
                  onAddNotes={onAddNotes}
                />
                {/* </KeyboardAwareScrollView> */}
              </BottomSheetScrollView>
            </Wrapper>
          );
        }}
      </Modal>
    );
  }
);
