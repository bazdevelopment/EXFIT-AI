import {
  type CalendarStatusMap,
  type IActivityLog,
} from '@/api/activity-logs/activity-logs.types';
import { type Nullable } from '@/types/general-types';

import { type ISegmentedControlOption } from '../segmented-control/segmented-control.interface';

export interface ICalendarMiniView {
  showYear: boolean;
  showMonth: boolean;
  containerClassName: string;
  currentWeekActivityLog: CalendarStatusMap;
  segmentedDays: ISegmentedControlOption[];
  currentMonth: string;
  currentYear: number;
  initialDayFocused: Nullable<ISegmentedControlOption>;
  currentMonthNumber: string;
  onDayPress?: (data: IActivityLog) => void;
  showStreak?: boolean;
  currentStreak?: number;
}
