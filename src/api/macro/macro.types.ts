// Request/Response Types for createMacroEntry
export interface ICreateMacroRequestData {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD format
  source?: 'manual' | 'chat';
}

export interface ICreateMacroResponseData {
  success: boolean;
  mealId: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  message: string;
}

// Request/Response Types for getDailyMacros
export interface IRequestDailyMacrosByDate {
  date: string; // YYYY-MM-DD format
}

export interface DailyMacroLogResponse {
  success: boolean;
  data: DailyMacroLog | null;
  message?: string;
}

export interface DailyMacroLog {
  date: string;
  userId: string;
  meals: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealsCount: number;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
}

export interface Meal {
  id: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt: any; // Firebase Timestamp
  source: 'manual' | 'chat';
}
export interface IGetDailyMacrosByDateRange {
  startDate: string;
  endDate: string;
}

export interface IDeleteMacroEntry {
  mealId: string;
  date: string;
}
