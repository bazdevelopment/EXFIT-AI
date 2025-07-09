import dayjs from 'dayjs';
import React from 'react';
import { View } from 'react-native';

import { useGetCalendarActivityLog } from '@/api/activity-logs/activity-logs.hooks';
import { useUser } from '@/api/user/user.hooks';
import { translate, useSelectedLanguage } from '@/core';

import CalendarMiniView from '../calendar-mini-view';
import Icon from '../icon';
import { colors, Text } from '../ui';
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

  const lastResetStreakDay =
    userInfo?.gamification.streakResetDates?.[
      userInfo?.gamification?.streakResetDates?.length - 1
    ];
  const lastResetStreakDate = dayjs(lastResetStreakDay).format('YYYY-MM-DD');

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
        <Icon
          icon={<ChevronLeftRounded color={colors.white} />}
          onPress={() => changeWeekOffset('left')}
          color={colors.white}
        />

        <View className="flex-1 items-center justify-center">
          <Text className="font-bold-nunito text-lg text-white">
            {interval}
          </Text>

          <Text className="mt-1 font-medium-nunito text-base text-gray-200">{`${translate('components.WeekBlock.week')} ${weekNumber} - ${currentMonth} ${currentYear}`}</Text>
        </View>

        <Icon
          icon={<ChevronRightRounded />}
          onPress={() => changeWeekOffset('right')}
          color={colors.white}
        />
      </View>
      <CalendarMiniView
        containerClassName="px-4 mb-[-10px] top-[-25px] z-[-1]"
        currentWeekActivityLog={currentWeekActivityLog}
        lastResetStreakDate={lastResetStreakDate}
        segmentedDays={segmentedDays}
        currentMonth={currentMonth}
        currentYear={currentYear}
        initialDayFocused={initialDayFocused}
        currentMonthNumber={currentMonthNumber}
        onDayPress={onDayPress}
        weekOffset={weekOffset}
        showYear={false}
        showMonth={false}
        showStreak={false}
      />
    </>
  );
};

export default WeekBlock;
