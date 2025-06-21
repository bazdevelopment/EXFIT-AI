import dayjs from 'dayjs';
import React from 'react';
import { View } from 'react-native';

import { useGetCalendarActivityLog } from '@/api/activity-logs/activity-logs.hooks';
import { translate, useSelectedLanguage } from '@/core';
import { useSegmentedSelection } from '@/core/hooks/use-segmented-selection';

import CalendarMiniView from '../calendar-mini-view';
import Icon from '../icon';
import { type ISegmentedControlOption } from '../segmented-control/segmented-control.interface';
import { colors, Text } from '../ui';
import { ChevronLeftRounded, ChevronRightRounded } from '../ui/assets/icons';
import { type IWeekBlock } from './week-block.interface';

/**
 * Component used do display segmented tab bar for handling weekly navigation
 */
const WeekBlock = ({
  reportSections,
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
}: IWeekBlock) => {
  const { checkIsActive, handleChangeSelection, selectedOption } =
    useSegmentedSelection(initialDayFocused as ISegmentedControlOption);

  const { language } = useSelectedLanguage();
  const { data: currentWeekActivityLog } = useGetCalendarActivityLog({
    startDate: dayjs().startOf('isoWeek').toISOString(),
    endDate: dayjs().endOf('isoWeek').toISOString(),
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
        containerClassName="px-2 mb-3"
        currentWeekActivityLog={currentWeekActivityLog}
        segmentedDays={segmentedDays}
        currentMonth={currentMonth}
        currentYear={currentYear}
        initialDayFocused={initialDayFocused}
        currentMonthNumber={currentMonthNumber}
        onDayPress={onDayPress}
      />
    </>
  );
};

export default WeekBlock;
