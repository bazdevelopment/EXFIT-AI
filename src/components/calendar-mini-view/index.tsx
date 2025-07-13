/* eslint-disable max-lines-per-function */
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { type IActivityLog } from '@/api/activity-logs/activity-logs.types';

import { type ISegmentedControlOption } from '../segmented-control/segmented-control.interface';
import { colors, Text } from '../ui';
import {
  AttendedCheckMark,
  HeartBreak,
  StreakFreeze,
  StreakIcon,
} from '../ui/assets/icons';

// Types
type DateStatus =
  | 'attended'
  | 'skipped'
  | 'challenge'
  | 'inactive'
  | 'streak_reset'
  | 'completed'
  | 'broken'
  | 'special'
  | 'pending';

interface DayData {
  dayTitle: string;
  dayNumber: number;
  status: DateStatus;
  isFocused?: boolean;
  isStreakReset: boolean;
  activities: IActivityLog[];
  dateKey: string;
}

interface ICalendarMiniView {
  showYear?: boolean;
  showMonth?: boolean;
  containerClassName?: string;
  currentWeekActivityLog?: Record<string, any>;
  segmentedDays?: { title: string; subtitle: string }[];
  currentMonth?: string;
  currentYear?: number | string;
  initialDayFocused?: { title: string };
  currentMonthNumber?: number;
  onDayPress?: (dateResponse: any) => void;
  weekOffset?: number;
  showStreak?: boolean;
  currentStreak?: number;
  lastResetStreakDate?: string;
  onCheckInPress?: () => void;
  showSuccessMessage?: boolean;
  weekData?: DayData[];
  layout?: 'horizontal' | 'vertical';
}

// Streak Display Component (Horizontal Layout)
const StreakDisplayHorizontal = ({
  currentStreak,
}: {
  currentStreak: number;
}) => (
  <View className="border-1 items-center justify-center self-stretch rounded-2xl border border-charcoal-600 p-3">
    <StreakIcon width={40} height={40} />
    <Text className="mt-2 font-bold-poppins text-lg text-orange-500 dark:text-orange-500">
      {currentStreak}
    </Text>
    <Text className="font-bold-poppins text-orange-500 dark:text-orange-500">
      days
    </Text>

    <Text className="font-medium-poppins text-white">streak</Text>
  </View>
);

// Streak Display Component (Vertical Layout)
const StreakDisplayVertical = ({
  currentStreak,
}: {
  currentStreak: number;
}) => (
  <View className="mb-6 flex-row items-center gap-1 rounded-2xl bg-[#191A21] px-4 py-3">
    <View className="items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 p-3">
      <StreakIcon width={40} height={40} />
    </View>
    <View>
      <Text className="font-bold-poppins text-2xl text-orange-400">
        {currentStreak} days
      </Text>
      <Text className="font-medium-poppins text-sm text-gray-400">streak</Text>
    </View>
  </View>
);

// Calendar Header Component
const CalendarHeader = ({
  currentMonth,
  currentYear,
  showMonth,
  showYear,
  layout = 'vertical',
}: {
  currentMonth?: string;
  currentYear?: number | string;
  showMonth?: boolean;
  showYear?: boolean;
  layout?: 'horizontal' | 'vertical';
}) => {
  if (layout === 'horizontal') {
    return (
      <Text
        className={`font-semibold-poppins text-xl text-white ${showMonth || showYear ? ' ml-1.5' : ''}`}
      >
        {showMonth ? currentMonth : ''} {showYear ? currentYear : ''}
      </Text>
    );
  }

  return (
    <View className="mb-4 flex-row items-center justify-center">
      {showMonth && (
        <Text className="mr-2 font-semibold-poppins text-xl text-white">
          {currentMonth}
        </Text>
      )}
      {showYear && (
        <Text className="font-semibold-poppins text-xl text-white">
          {currentYear}
        </Text>
      )}
    </View>
  );
};

// Enhanced Day Item Component
const DayItem = ({
  dayTitle,
  dayNumber,
  status,
  isFocused,
  onPress,
  isStreakReset,
  layout = 'vertical',
}: DayData & {
  onPress?: () => void;
  layout?: 'horizontal' | 'vertical';
}) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
      case 'attended':
        return (
          <View className="flex items-center justify-center  ">
            <AttendedCheckMark />
          </View>
        );
      case 'skipped':
        return (
          <View className="flex  items-center justify-center">
            <HeartBreak fill={colors.danger[400]} />
          </View>
        );
      case 'inactive':
        return (
          <>
            {isStreakReset ? (
              <StreakFreeze width={27} height={27} top={-3} />
            ) : (
              <View className="flex size-6 items-center justify-center rounded-full border border-dashed border-gray-500" />
            )}
          </>
        );
      default:
        return <View className="size-8" />;
    }
  };

  const textColor = isFocused ? 'text-white' : 'text-gray-400';
  const containerClasses =
    layout === 'horizontal'
      ? `items-center gap-y-2 rounded-lg p-2 ${isFocused ? 'bg-gray-800' : ''}`
      : 'items-center';

  const content =
    layout === 'horizontal' ? (
      <>
        <Text className={`font-semibold-poppins text-sm ${textColor}`}>
          {dayTitle}
        </Text>
        <Text className={`font-bold-poppins text-base ${textColor}`}>
          {dayNumber}
        </Text>
        {getIcon()}
      </>
    ) : (
      <>
        <Text className={`mb-2 text-sm font-semibold ${textColor}`}>
          {dayTitle}
        </Text>
        {status === 'inactive' ? (
          <View className="flex size-8 items-center justify-center rounded-full border-2 border-dashed border-gray-500">
            <Text className="font-semibold-poppins text-xs text-white">
              {dayNumber}
            </Text>
          </View>
        ) : (
          <View className="relative">
            <View className="flex size-8 items-center justify-center rounded-full bg-orange-500">
              <Text className="font-semibold-poppins text-xs text-white">
                {dayNumber}
              </Text>
            </View>
            {(status === 'completed' || status === 'attended') && (
              <View className="absolute -right-1 -top-1 size-4 items-center justify-center rounded-full bg-orange-600">
                <Ionicons name="checkmark-sharp" size={8} color="white" />
              </View>
            )}
            {(status === 'special' || status === 'streak_reset') && (
              <View className="absolute -right-1 -top-1 size-4 items-center justify-center rounded-full bg-blue-600">
                <MaterialCommunityIcons name="heart" size={8} color="white" />
              </View>
            )}
          </View>
        )}
      </>
    );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} className={containerClasses}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View className={containerClasses}>{content}</View>;
};

// Helper function to generate week data from currentWeekActivityLog
const generateWeekDataFromLog = (
  currentWeekActivityLog: Record<string, any>,
  segmentedDays: any,
  lastResetStreakDate: string,
  initialDayFocused: ISegmentedControlOption
) => {
  const weekData: DayData[] = [];
  const dayTitles = segmentedDays.map((day) => day.title);

  // Get all dates from the log and sort them
  const dates = Object.keys(currentWeekActivityLog).sort();
  dates.forEach((dateKey, index) => {
    const [_year, _month, day] = dateKey.split('-');
    const dayNumber = parseInt(day);
    const dayTitle = dayTitles[index];
    const logData = currentWeekActivityLog[dateKey];

    const isStreakReset = dateKey === lastResetStreakDate;
    let status: DateStatus = 'inactive';
    if (logData && Array.isArray(logData) && logData.length > 0) {
      // Check if any activity has "attended" status
      const hasAttended = logData.some(
        (activity: any) => activity.status === 'attended'
      );
      if (hasAttended) {
        status = 'attended';
      } else {
        // Use the first activity's status
        status = logData[0].status || 'inactive';
      }
    }

    weekData.push({
      dayTitle,
      dayNumber,
      status,
      isFocused: day === initialDayFocused.subtitle, // You can set this based on current date logic
      isStreakReset,
      activities: logData,
      dateKey,
    });
  });

  return weekData;
};

// Main Calendar Component
const CalendarMiniView = ({
  showYear = false,
  showMonth = false,
  containerClassName = '',
  currentWeekActivityLog = {},
  segmentedDays = [],
  currentMonth,
  currentYear,
  initialDayFocused,
  currentMonthNumber,
  onDayPress,
  showStreak = true,
  currentStreak = 4,
  lastResetStreakDate,
  layout = 'horizontal',
}: ICalendarMiniView) => {
  // Generate week data from currentWeekActivityLog if not provided
  const generatedWeekData = generateWeekDataFromLog(
    currentWeekActivityLog,
    segmentedDays,
    lastResetStreakDate,
    initialDayFocused
  );
  // Horizontal Layout (matching the second reference)
  if (layout === 'horizontal') {
    return (
      <View
        className={`flex-row items-center rounded-2xl bg-black ${containerClassName}`}
      >
        {/* Left Side: Streak Counter */}
        {showStreak && (
          <StreakDisplayHorizontal currentStreak={currentStreak} />
        )}

        {/* Right Side: Calendar */}
        <View className="ml-2 flex-1">
          <CalendarHeader
            currentMonth={currentMonth}
            currentYear={currentYear}
            showMonth={showMonth}
            showYear={showYear}
            layout="horizontal"
          />
          <View className="flex-row justify-between">
            {generatedWeekData.map((item) => (
              <DayItem
                key={`${item.dayTitle}-${item.dayNumber}`}
                dayTitle={item.dayTitle}
                dayNumber={item.dayNumber}
                status={item.status}
                isFocused={item.isFocused}
                isStreakReset={item.isStreakReset}
                onPress={() => onDayPress?.(item)}
                layout="horizontal"
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  const currentWeekActivityDates = segmentedDays.map((dayItem) => {
    const day = Number(dayItem.subtitle);
    const dateKey = `${currentYear}-${currentMonthNumber}-${dayItem.subtitle}`; // Adjust if leading zeros are missing
    const data = currentWeekActivityLog?.[dateKey] || null;
    const isStreakReset = dateKey === lastResetStreakDate;
    return { day, data, isStreakReset };
  });

  return (
    <View
      className={`w-full rounded-2xl bg-[#1c1c1e] p-6 ${containerClassName}`}
    >
      {/* Streak Display */}
      {showStreak && <StreakDisplayVertical currentStreak={currentStreak} />}

      {/* Calendar Header */}
      <CalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        showMonth={showMonth}
        showYear={showYear}
        layout="vertical"
      />

      {/* Date Circles */}
      <View className="mb-4 flex-row justify-between px-2">
        {currentWeekActivityDates.map((dateResponse, index) => {
          const { data } = dateResponse;
          let status: DateStatus = 'inactive';

          if (data?.length) {
            status = data.some(
              (activity: any) => activity.status === 'attended'
            )
              ? 'attended'
              : data[0]?.status || 'inactive';
          }

          const dayData = generatedWeekData[index];

          return (
            <DayItem
              key={`${index}-${dateResponse.day}`}
              dayTitle={dayData.dayTitle}
              dayNumber={dateResponse.day}
              status={status}
              isFocused={dayData.isFocused}
              onPress={() => onDayPress?.(dateResponse)}
              isStreakReset={dayData.isStreakReset}
              layout="vertical"
            />
          );
        })}
      </View>
    </View>
  );
};

export default CalendarMiniView;
