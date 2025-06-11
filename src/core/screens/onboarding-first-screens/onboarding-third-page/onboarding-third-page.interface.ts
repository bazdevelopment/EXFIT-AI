export interface IOnboardingThirdPage {
  totalSteps: number;
  currentScreenIndex: number;
  goToPreviousScreen: () => void;
  onFinish: () => void;
  goToNextScreen: () => void;
  onSkip: () => void;
  isLastScreenDisplayed: boolean;
}
