export interface IStreakWarning {
  isStreakReset?: boolean;
  isStreakFreezeUsed?: boolean;
  isStreakRepaired?: boolean;
  isElixirUsageExpired?: boolean;
  onRepairStreak?: (value: string | number) => void;
  isRepairStreakPending?: boolean;
}
