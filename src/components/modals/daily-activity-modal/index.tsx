/* eslint-disable max-lines-per-function */
import {
  type BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import ActivitiesList from '@/components/activities-list';
import CustomAlert from '@/components/custom-alert';
import StreakWarning from '@/components/streak-warning';
import Toast from '@/components/toast';
import { Image, Modal, Text } from '@/components/ui';
import { FlashIcon, GemIcon } from '@/components/ui/assets/icons';
import { useSelectedLanguage } from '@/core';
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
      isRepairStreakPending,
      hasUserRepairStreakElixir,
    },
    ref
  ) => {
    const height = 550;
    const snapPoints = useMemo(() => [height, '90%'], [height]);
    const { language } = useSelectedLanguage();

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
            title="Streak Broke! Save it now!"
            subtitle="Buy a Streak Repair Elixir for 800 💎 to bring back your lost streak."
            buttons={[
              {
                label: 'Let It Break',
                variant: '',
                onPress: () => Toast.dismiss(),
                className:
                  'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
                buttonTextClassName: 'text-white dark:text-white text-sm',
              },
              {
                label: 'Buy & Save Streak',
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
          title="Streak in Peril! Revive It Now!"
          subtitle={`Bring your ${lostStreakValue}-day streak back to life with the powerful Streak Repair Elixir!`}
          buttons={[
            {
              label: 'Let It Break',
              variant: '',
              onPress: () => Toast.dismiss(),
              className:
                'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
              buttonTextClassName: 'text-white dark:text-white text-sm',
            },
            {
              label: 'Use Elixir',
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
          const totalXP =
            data.activities?.reduce(
              (sum, activity) => sum + activity.xpEarned,
              0
            ) || 0;
          const totalGems =
            data.activities?.reduce(
              (sum, activity) => sum + activity.gemsEarned,
              0
            ) || 0;

          return (
            <>
              <BlurView
                blurAmount={30}
                blurType="dark"
                style={[StyleSheet.absoluteFill]}
              />
              <BottomSheetScrollView
                className="flex-1 px-4 pt-6"
                // contentContainerClassName="mb-[200]"
                showsVerticalScrollIndicator={false}
              >
                {/* Header with Date */}
                <View className="mb-6 items-center">
                  {/* Day Number */}

                  {/* Title and Date */}
                  <Text className="mb-4 mt-[-10px] font-bold-poppins text-xl text-white">
                    {dayjs(data.dateKey).format('dddd, MMMM D')}
                  </Text>
                  <StreakWarning
                    isStreakReset={data?.isStreakReset}
                    isStreakFreezeUsed={data?.isStreakFreezeUsed}
                    isStreakRepaired={data?.isStreakRepaired}
                    isElixirUsageExpired={data?.isElixirUsageExpired}
                    onRepairStreak={() =>
                      handleRepairStreak(data?.lostStreakValue)
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
                        {data.activities?.length || 0}
                      </Text>
                      <Text className="font-medium-poppins text-sm text-white">
                        Activities
                      </Text>
                    </View>
                  </View>
                </View>

                <ActivitiesList
                  activities={data.activities}
                  onAddActivity={() => onAddActivity(data.dateKey)}
                  isToday={checkIsToday(data.dateKey, language)}
                />
              </BottomSheetScrollView>
            </>
          );
        }}
      </Modal>
    );
  }
);
