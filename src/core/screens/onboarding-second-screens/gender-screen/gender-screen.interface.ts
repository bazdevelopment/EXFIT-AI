import { type IOnboardingCollectedData } from '@/app/onboarding-second';

export interface IGenderScreen {
  totalSteps: number;
  goToNextScreen: (data: IOnboardingCollectedData) => void;
  currentScreenIndex: number;
  collectedData: IOnboardingCollectedData;
}
