import { useState } from 'react';

import { POSITIONS, type TPositions } from '@/constants/positions';
import { type IDayOfWeek } from '@/types/date-time';

import { useSelectedLanguage } from '../i18n';
import {
  getCurrentDay,
  getCurrentMonth,
  getCurrentMonthNumber,
  getDaysOfWeek,
  getSegmentedDays,
  getStartAndEndWeek,
  getWeekInterval,
  getWeekNumber,
  getYearFromWeekOffset,
} from '../utilities/date-time-helpers';

/**
 * Custom hook used to handle the navigation between weeks
 */
export const useWeekNavigation = () => {
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const { language } = useSelectedLanguage();

  const weekNumber: number = getWeekNumber(weekOffset, language);
  const currentYear = getYearFromWeekOffset(weekOffset, language);

  const weekDates: IDayOfWeek[] = getDaysOfWeek(
    weekNumber,
    currentYear,
    language
  );
  const currentMonth = getCurrentMonth(currentYear, weekNumber, language);
  const currentMonthNumber = getCurrentMonthNumber(
    currentYear,
    weekNumber,
    language
  );
  const segmentedDays = getSegmentedDays(weekDates);
  const interval = getWeekInterval(currentYear, weekNumber, language);
  const currentDay = getCurrentDay('ddd', language);
  const currentDayNumber = getCurrentDay('DD', language);

  const { startOfWeek, endOfWeek } = getStartAndEndWeek(
    currentYear,
    weekNumber,
    language
  );
  const initialDayFocused = segmentedDays.find(
    (day) => day.title === currentDay
  );

  const changeWeekOffset = (iconPosition: TPositions) => {
    if (iconPosition === POSITIONS.LEFT) {
      setWeekOffset((prevOffset) => prevOffset - 1);
    }

    if (iconPosition === POSITIONS.RIGHT) {
      setWeekOffset((prevOffset) => prevOffset + 1);
    }
  };

  return {
    weekOffset,
    segmentedDays,
    interval,
    weekNumber,
    currentMonth,
    currentYear,
    currentDay,
    changeWeekOffset,
    initialDayFocused,
    startOfWeek,
    endOfWeek,
    currentMonthNumber,
    currentDayNumber,
  };
};
