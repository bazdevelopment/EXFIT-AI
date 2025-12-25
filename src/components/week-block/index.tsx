import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useGetCalendarActivityLog } from '@/api/activity-logs/activity-logs.hooks';
import { useUser } from '@/api/user/user.hooks';
import { translate, useSelectedLanguage } from '@/core';

import CalendarMiniView from '../calendar-mini-view';
import { Text } from '../ui';
import { ChevronLeftRounded, ChevronRightRounded } from '../ui/assets/icons';
import { type IWeekBlock } from './week-block.interface';

/**
 * Component used do display segmented tab bar for handling weekly navigation
 */
const WeekBlock = ({
  onDayPress,
  weekOffset,
  initialDayFocused,
  changeWeekOffset,
  weekNumber,
  currentMonth,
  interval,
  currentYear,
  segmentedDays,
  currentMonthNumber,
  className,
  startOfWeek,
  endOfWeek,
}: IWeekBlock) => {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

  const lastResetStreakDates = userInfo?.gamification.streakResetDates;
  const streakFreezeUsageDates = userInfo?.gamification?.streakFreezeUsageDates;
  const streakRepairDates = userInfo?.gamification?.streakRepairDates;

  const { data: currentWeekActivityLog } = useGetCalendarActivityLog({
    startDate: startOfWeek,
    endDate: endOfWeek,
    language,
  });

  return (
    <>
      <View
        className={`mb-4 flex-row items-center justify-between ${className}`}
      >
        <TouchableOpacity
          onPress={() => changeWeekOffset('left')}
          className="rounded-lg p-2"
        >
          <ChevronLeftRounded />
        </TouchableOpacity>

        <View className="flex-1 items-center justify-center">
          <Text className="font-bold-poppins text-lg text-white">
            {interval}
          </Text>

          <Text className="mt-1 font-medium-poppins text-base text-gray-200">{`${translate('components.WeekBlock.week')} ${weekNumber} - ${currentMonth} ${currentYear}`}</Text>
        </View>

        <TouchableOpacity
          onPress={() => changeWeekOffset('right')}
          className="rounded-lg p-2"
        >
          <ChevronRightRounded />
        </TouchableOpacity>
      </View>
      <CalendarMiniView
        containerClassName="px-4 mb-[-10px] top-[-25px] z-[-1]"
        currentWeekActivityLog={currentWeekActivityLog}
        segmentedDays={segmentedDays}
        currentMonth={currentMonth}
        currentYear={currentYear}
        initialDayFocused={initialDayFocused}
        currentMonthNumber={currentMonthNumber}
        lastResetStreakDates={lastResetStreakDates}
        streakFreezeUsageDates={streakFreezeUsageDates}
        streakRepairDates={streakRepairDates}
        onDayPress={onDayPress}
        weekOffset={weekOffset}
        showYear={false}
        showMonth={false}
        showStreak={false}
        showProgress={false}
      />
    </>
  );
};

export default WeekBlock;
