import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '../ui';
import { StreakIcon } from '../ui/assets/icons';
import { type ICalendarMiniView } from './calendar-mini-view.interface';

const CalendarMiniView = ({
  showYear,
  showMonth,
  containerClassName,
  currentWeekActivityLog,
  segmentedDays,
  currentMonth,
  currentYear,
  initialDayFocused,
  currentMonthNumber,
  onDayPress,
  weekOffset,
  showStreak = false,
  currentStreak,
  lastResetStreakDate,
}: ICalendarMiniView) => {
  const daysOfWeek = segmentedDays.map((day) => day.title);
  // Hardcoded data to match the image exactly
  const currentWeekActivityDates = segmentedDays.map((dayItem) => {
    const day = Number(dayItem.subtitle);
    const dateKey = `${currentYear}-${currentMonthNumber}-${dayItem.subtitle}`; // Adjust if leading zeros are missing
    const data = currentWeekActivityLog?.[dateKey] || null;
    const isStreakReset = dateKey === lastResetStreakDate;

    return { day, data, isStreakReset };
  });
  return (
    <View className={`w-full rounded-lg ${containerClassName}`}>
      {/* 1. Header: Year and Month */}

      <View
        className={`flex-row items-center justify-between gap-2 ${(showYear || showMonth) && 'mb-6'}`}
      >
        {showStreak && (
          <View className="flex-row items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 dark:bg-gray-800">
            <StreakIcon width={25} height={25} />
            <Text className="font-bold-nunito text-lg">
              {currentStreak} days streak
            </Text>
          </View>
        )}

        <View className="flex-1 flex-row justify-end gap-2">
          {showMonth && (
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-bold text-xl text-white">
                {currentMonth}
              </Text>

              {/* <Feather name="chevron-down" size={24} color="white" /> */}
            </TouchableOpacity>
          )}
          {showYear && (
            <Text className="text-xl font-bold text-white">{currentYear}</Text>
          )}
        </View>
      </View>

      {/* 2. Days of the Week */}
      <View className="mb-4 flex-row justify-between">
        {daysOfWeek.map((day) => (
          <Text
            key={day}
            className={`w-12 text-center font-semibold-nunito text-base text-gray-400 ${day === initialDayFocused?.title && weekOffset === 0 ? 'font-extra-bold-nunito color-[#3195FD]' : ''}`}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* 3. Dates Row */}
      <View className="mb-4 flex-row justify-between">
        {currentWeekActivityDates.map((dateResponse, index) => {
          const { data } = dateResponse;
          const status = data === null ? 'inactive' : data[0].status;
          return (
            <DateCircle
              key={index}
              day={dateResponse.day}
              status={status}
              isStreakReset={dateResponse.isStreakReset}
              onPress={() => onDayPress?.(dateResponse)}
            />
          );
        })}
      </View>

      {/* 4. Legend */}
      <View className="flex-row items-center justify-center gap-4">
        <LegendItem color="bg-green-400" label="Active" />
        <LegendItem color="bg-red-500" label="Skipped" />
        <LegendItem
          color="bg-black border-[1px] border-dashed border-white/60 p-2"
          label="Inactive"
        />
        <LegendItem color="border-[1px] bg-blue-500 p-2" label="Streak reset" />
      </View>
    </View>
  );
};

export default CalendarMiniView;

// Define the possible statuses for a date
type DateStatus = 'attended' | 'skipped' | 'challenge' | 'inactive' | 'empty';

// Define the structure for our date data
const DateCircle = ({
  day,
  status,
  onPress,
  isStreakReset,
}: {
  day: number | null;
  status: DateStatus;
  onPress: () => void;
  isStreakReset: boolean;
}) => {
  // If the day is null, render an empty placeholder to maintain grid alignment
  if (!day) {
    return <View className="size-12" />;
  }

  // Define styles for each status using a key-value map
  const statusStyles = {
    attended: 'bg-green-400',
    skipped: 'bg-red-500',
    challenge: 'bg-gray-800',
    inactive: isStreakReset
      ? 'bg-blue-500'
      : 'border-2 border-dashed border-gray-500',
    empty: '', // No special style for empty
  };

  // Base classes for all circles
  const baseClasses = 'w-12 h-12 rounded-full flex items-center justify-center';
  const textClasses = 'text-white font-bold text-lg';

  return (
    <TouchableOpacity onPress={onPress}>
      <View className={`${baseClasses} ${statusStyles[status]}`}>
        <Text className={textClasses}>{day}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Reusable LegendItem Component ---
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View className="flex-row items-center">
    <View className={`size-3 rounded-full ${color}`} />
    <Text className="ml-2 text-sm text-gray-400">{label}</Text>
  </View>
);
