import { type IActivityLog } from '@/api/activity-logs/activity-logs.types';
import { type ISegmentedControlOption } from '@/components/segmented-control/segmented-control.interface';

import dayjs from '../../lib/dayjs';

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
  isStreakFreezeUsed: boolean;
  isStreakRepaired: boolean;
  isElixirUsageExpired: boolean;
  activities: IActivityLog[];
  dateKey: string;
  lostStreakValue: number;
}

// Helper function to generate week data from currentWeekActivityLog
export const generateWeekDataOverview = ({
  currentWeekActivityLog,
  segmentedDays,
  lastResetStreakDates,
  initialDayFocused,
  streakFreezeUsageDates,
  streakRepairDates,
  lastTimeLostStreakTimestamp,
  lostStreakValue,
}: {
  currentWeekActivityLog: Record<string, any>;
  segmentedDays: any;
  lastResetStreakDates: string[];
  initialDayFocused: ISegmentedControlOption;
  streakFreezeUsageDates: string[];
  streakRepairDates: string[];
  lastTimeLostStreakTimestamp: string;
  lostStreakValue: number;
}) => {
  const lasResetStreakDateFormatted = lastResetStreakDates?.map((date) =>
    dayjs(date).format('YYYY-MM-DD')
  );

  const weekData: DayData[] = [];
  const dayTitles = segmentedDays.map((day) => day.title);

  const streakRepairDatesFormatted = streakRepairDates?.map((date) =>
    dayjs(date).format('YYYY-MM-DD')
  );
  const streakFreezeUsageDatesFormatted = streakFreezeUsageDates?.map((date) =>
    dayjs(date).format('YYYY-MM-DD')
  );

  // Get all dates from the log and sort them
  const dates =
    currentWeekActivityLog && Object.keys(currentWeekActivityLog).sort();
  dates?.forEach((dateKey, index) => {
    const [_year, _month, day] = dateKey.split('-');
    const dayNumber = parseInt(day);
    const dayTitle = dayTitles[index];
    const logData = currentWeekActivityLog[dateKey];
    const isStreakReset = lasResetStreakDateFormatted?.includes(dateKey);
    const isStreakFreezeUsed =
      streakFreezeUsageDatesFormatted?.includes(dateKey);
    const isStreakRepaired = streakRepairDatesFormatted?.includes(dateKey);
    /**map all the streak repair dates  */

    const isElixirUsageExpired = (() => {
      if (!lastTimeLostStreakTimestamp) {
        return true; // No streak lost yet, so elixir usage is not expired
      }

      const resetDateTime = dayjs(lastTimeLostStreakTimestamp);
      const expiryDateTime = resetDateTime.add(48, 'hours');
      const now = dayjs();
      return now.isAfter(expiryDateTime);
    })();

    let status: DateStatus = 'inactive';
    if (logData && Array.isArray(logData) && logData.length > 0) {
      // Check if any activity has "attended" status
      const hasAttended = logData.some(
        (activity: any) =>
          activity.status === 'attended' || activity.status === 'completed'
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
      isStreakFreezeUsed,
      isStreakRepaired,
      isElixirUsageExpired,
      lostStreakValue,
      activities: logData,
      dateKey,
    });
  });

  return weekData;
};
