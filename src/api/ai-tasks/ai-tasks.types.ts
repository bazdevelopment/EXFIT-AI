export interface IGetTasksRequestData {
  date: string; // Expected in "YYYY-MM-DD" format.
}

/**
 * The structure of a single task object that will be returned to the client.
 */
export interface AiTaskResponse {
  id: string;
  createdAt: string; // ISO string for easy parsing on the client
  expiresAt: string; // ISO string
  trigger: string;
  title: string;
  streakPoints: number;
  durationMinutes: number;
  status: 'active' | 'completed' | 'skipped' | 'expired';
}

export interface ICreateTaskRequestData {
  trigger: string; // e.g., "excuse_buster_chat"
  title: string; // e.g., "Energy Boost Challenge"
  durationMinutes: number; // e.g., 10
  xpReward: number;
  gemsReward: number;
  language: string;
  description: string;
}

export interface ITaskUpdateRequestData {
  taskId: string;
  status: 'completed' | 'skipped';
  language: string;
}

export interface ITaskUpdateStatusResponse {
  success: boolean;
  newBalance?: number;
}

// --- Type Definition for the data sent from the client ---
export interface IUpdateTaskNotesRequest {
  taskId: string;
  notes: string;
}

export interface IUpdateTaskNotesResponse {
  success: boolean;
  message: string;
}
