import { type IOnboardingCollectedData } from '@/app/onboarding-second';

export interface IExperienceLevelScreen {
  totalSteps: number;
  currentScreenIndex: number;
  goToPreviousScreen: () => void;
  onFinish: (data: IOnboardingCollectedData) => void;
  isSubmitOnboardingLoading: boolean;
}
