import { TouchableOpacity, View } from 'react-native';

import { Text } from '../ui';

const CalendarMiniView = ({ showYear, showMonth, containerClassName }) => {
  const year = '2025';
  const month = 'June';
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Hardcoded data to match the image exactly
  const dates: DateItem[] = [
    { day: 29, status: 'inactive' },
    { day: 30, status: 'inactive' },
    { day: 1, status: 'completed' },
    { day: 2, status: 'completed' },
    { day: 3, status: 'skipped' },
    { day: 4, status: 'completed' },
    { day: 5, status: 'challenge' },
  ];

  return (
    <View className={`w-full rounded-lg ${containerClassName}`}>
      {/* 1. Header: Year and Month */}
      <View
        className={`flex-row items-center justify-between ${(showYear || showMonth) && 'mb-6'}`}
      >
        {showYear && (
          <Text className="text-3xl font-bold text-white">{year}</Text>
        )}
        {showMonth && (
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-bold mr-1 text-xl text-white">{month}</Text>
            {/* <Feather name="chevron-down" size={24} color="white" /> */}
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Days of the Week */}
      <View className="mb-4 flex-row justify-between">
        {daysOfWeek.map((day) => (
          <Text
            key={day}
            className="w-12 text-center text-base font-semibold text-gray-400"
          >
            {day}
          </Text>
        ))}
      </View>

      {/* 3. Dates Row */}
      <View className="mb-6 flex-row justify-between">
        {dates.map((date, index) => (
          <DateCircle key={index} day={date.day} status={date.status} />
        ))}
      </View>

      {/* 4. Legend */}
      <View className="flex-row items-center justify-center gap-2">
        <LegendItem color="bg-green-400" label="Completed" />
        <LegendItem color="bg-red-500" label="Skipped" />
        <LegendItem
          color="bg-black border-[1px] border-dashed border-white/60 p-2"
          label="Inactive"
        />
      </View>
    </View>
  );
};

export default CalendarMiniView;

// Define the possible statuses for a date
type DateStatus = 'completed' | 'skipped' | 'challenge' | 'inactive' | 'empty';

// Define the structure for our date data
interface DateItem {
  day: number | null; // Allow null for empty grid cells
  status: DateStatus;
}

const DateCircle = ({
  day,
  status,
}: {
  day: number | null;
  status: DateStatus;
}) => {
  // If the day is null, render an empty placeholder to maintain grid alignment
  if (!day) {
    return <View className="size-12" />;
  }

  // Define styles for each status using a key-value map
  const statusStyles = {
    completed: 'bg-green-400',
    skipped: 'bg-red-500',
    challenge: 'bg-gray-800',
    inactive: 'border-2 border-dashed border-gray-500',
    empty: '', // No special style for empty
  };

  // Base classes for all circles
  const baseClasses = 'w-12 h-12 rounded-full flex items-center justify-center';
  const textClasses = 'text-white font-bold text-lg';

  return (
    <View className={`${baseClasses} ${statusStyles[status]}`}>
      <Text className={textClasses}>{day}</Text>
    </View>
  );
};

// --- Reusable LegendItem Component ---
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View className="flex-row items-center">
    <View className={`size-3 rounded-full ${color}`} />
    <Text className="ml-2 text-sm text-gray-400">{label}</Text>
  </View>
);
