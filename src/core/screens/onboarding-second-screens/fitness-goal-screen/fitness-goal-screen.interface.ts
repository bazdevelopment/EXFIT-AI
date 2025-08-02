import { type IOnboardingCollectedData } from '@/app/onboarding-second';

export interface IFitnessGoalScreen {
  totalSteps: number;
  goToNextScreen: (data: IOnboardingCollectedData) => void;
  currentScreenIndex: number;
  goToPreviousScreen: () => void;
  onSkip: () => void;
  isSubmitOnboardingLoading: boolean;
  collectedData: IOnboardingCollectedData;
}
