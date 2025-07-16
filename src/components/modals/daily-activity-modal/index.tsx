/* eslint-disable max-lines-per-function */
import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Modal, Text } from '@/components/ui';
import { FlashIcon, GemIcon, StreakFreeze } from '@/components/ui/assets/icons';
import { useSelectedLanguage } from '@/core';
import { checkIsToday } from '@/core/utilities/date-time-helpers';

import dayjs from '../../../lib/dayjs';

interface DailyActivityModalProps {
  onAddActivity: (date: string) => void;
  totalTodayActivities: number;
}

export const DailyActivityModal = React.forwardRef<
  BottomSheetModal,
  DailyActivityModalProps
>(({ onAddActivity, totalTodayActivities }, ref) => {
  // const height = totalTodayActivities >= 2 ? 550 : 400;
  const height = 550;
  const snapPoints = useMemo(() => [height, '80%'], [height]);
  const { language } = useSelectedLanguage();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'custom_activity':
        return '🏃‍♂️';
      case 'daily_checkin':
        return '✅';
      case 'workout':
        return '💪';
      case 'cardio':
        return '❤️';
      case 'strength':
        return '🏋️‍♂️';
      default:
        return '⚡';
    }
  };

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
              blurAmount={20}
              blurType="dark"
              style={[StyleSheet.absoluteFill]}
            />
            <ScrollView
              className="flex-1 px-4 pt-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Header with Date */}
              <View className="mb-6 items-center">
                {/* Day Number */}

                {/* Title and Date */}
                <Text className="mb-4 mt-[-10px] font-bold-poppins text-xl text-white">
                  {dayjs(data.dateKey).format('dddd, MMMM D')}
                </Text>

                {/* Streak Reset Warning */}
                {data?.isStreakReset && (
                  <View className="mb-4 w-full rounded-2xl border border-red-500/50 bg-red-500/20 p-4">
                    <View className="mb-2 flex-row items-center justify-center">
                      <StreakFreeze width={40} height={40} />
                      <Text className="font-bold-poppins text-lg text-red-300">
                        Streak freeze!
                      </Text>
                    </View>
                    <Text className="text-center text-sm text-red-200">
                      Your streak was reset on this day. Time to build it back
                      up stronger!
                    </Text>
                  </View>
                )}

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

              {/* Activities List */}
              {data.activities && data.activities.length > 0 ? (
                data.activities.map((activity, index) => (
                  <View
                    key={activity.id}
                    className="mb-3 rounded-xl bg-white/10 p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center">
                        <View className="mr-3 size-12 items-center justify-center rounded-full bg-gray-500/30">
                          <Text className="ml-1 text-lg">
                            {getActivityIcon(activity.type)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-semibold-poppins capitalize text-white">
                            {activity.type.replace('_', ' ')}
                          </Text>
                          <Text className="text-sm text-white">
                            {dayjs(activity.createdAt).format('hh:mm A')}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end">
                        <View
                          className={`mb-2 rounded-full px-3 py-1 ${
                            activity.status === 'attended'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }`}
                        >
                          <Text className="font-bold-poppins text-xs text-white">
                            {activity.status === 'attended'
                              ? 'Completed'
                              : activity.status}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <View className="flex-row gap-2">
                            <GemIcon width={16} height={16} />
                            <Text className="mr-4 font-bold-poppins text-sm text-yellow-400">
                              {activity.gemsEarned}
                            </Text>
                          </View>
                          <View className="flex-row gap-2">
                            <FlashIcon width={16} height={16} />
                            <Text className="font-bold-poppins text-sm text-purple-400">
                              {activity.xpEarned}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="mb-6 items-center rounded-xl bg-white/5 p-6">
                  <Text className="mb-3 text-4xl">🎯</Text>
                  <Text className="mb-2 font-semibold-poppins text-lg text-white">
                    No Physical Activities
                  </Text>

                  {checkIsToday(data.dateKey, language) && (
                    <Text className="text-center text-sm text-gray-400">
                      Add your first physical activity you did today!
                    </Text>
                  )}
                </View>
              )}

              {/* Action Button */}
              {checkIsToday(data.dateKey, language) && (
                <TouchableOpacity
                  onPress={() => onAddActivity(data.dateKey)}
                  className="mb-8 items-center rounded-xl bg-blue-500 p-4"
                >
                  <Text className="font-semibold-poppins text-white">
                    Add Activity
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </>
        );
      }}
    </Modal>
  );
});
