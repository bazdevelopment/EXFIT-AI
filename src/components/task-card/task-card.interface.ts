export interface ITaskCardProps {
  id?: string;
  activityName: string;
  durationMinutes: number;
  gemsEarned: number;
  xpEarned: number;
  description: string;
  status?: 'active' | 'completed' | 'active'; // Simplified statuses for the new design
  className?: string;
  askCoach: string;
  onCompleteTask?: (task: ITaskCardProps) => void;
  onCreateTask?: () => void;
  isCreatingTaskPending?: boolean; // New prop to handle task creation state
}
