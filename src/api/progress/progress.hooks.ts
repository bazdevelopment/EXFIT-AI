import { type AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { fetchProgressAnalytics } from './progress.request';
// Import BarChartItem and PieChartItem types

// Define the shape of the data we expect to receive from the Cloud Function.
// This provides excellent type safety and autocompletion in your components.
export interface ProgressData {
  kpis: {
    currentStreak: number;
    totalXp: number;
    gemsBalance: number;
  };
  calendarData: {
    [date: string]: {
      marked: boolean;
      dotColor: string;
      activeOpacity: number;
    };
  };
  weeklyXpChartData: BarChartItem[];
  activityPieChartData: PieChartItem[];
  streakHistoryChartData: { value: number; date: string }[];
  monthlyActivityChartData: BarChartItem[];
  detailedStats: {
    longestStreak: number;
  };
}

export const useProgressData = () =>
  createQuery<any, any, AxiosError>({
    queryKey: ['progress-analytics'],
    fetcher: fetchProgressAnalytics,
  })();
