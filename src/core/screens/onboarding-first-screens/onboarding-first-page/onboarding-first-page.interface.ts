export interface IOnboardingFirstPage {
  totalSteps: number;
  currentScreenIndex: number;
  goToPreviousScreen: () => void;
  onFinish: () => void;
  goToNextScreen: () => void;
  onSkip: () => void;
}
