export interface IDailyCheckInStatus {
  additionalClassname?: string;
  statuses: ('active' | 'attended' | 'skipped' | 'completed')[];
}
