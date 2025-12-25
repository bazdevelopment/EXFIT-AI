import { router } from 'expo-router';
import React, { useState } from 'react';

import FlowModal from '@/components/flow-modal';
import { useFirstOnboarding } from '@/core/hooks/use-first-onboarding';
import OnboardingFirstPage from '@/core/screens/onboarding-first-screens/onboarding-first-page';
import OnboardingFourthPage from '@/core/screens/onboarding-first-screens/onboarding-fourth-page';
import OnboardingSecondPage from '@/core/screens/onboarding-first-screens/onboarding-second-page';

export interface IOnboardingCollectedData {
  preferredName: string;
}

export default function OnboardingFirst() {
  const [collectedData, setCollectedData] = useState<IOnboardingCollectedData>({
    preferredName: '',
  });
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const [isFirstOnboardingDone, setIsFirstOnboardedDone] = useFirstOnboarding();

  const handleGoToNextScreen = (newCollectedData: IOnboardingCollectedData) => {
    setCollectedData((prevCollectedData) => ({
      ...prevCollectedData,
      ...newCollectedData,
    }));
    setCurrentScreenIndex((prevIndex) => prevIndex + 1);
  };

  const handleGoToPreviousScreen = () =>
    setCurrentScreenIndex((prevIndex) => prevIndex - 1);

  const handleOnFinishFlow = () => {
    !isFirstOnboardingDone && setIsFirstOnboardedDone(true);
    router.navigate('/anonymous-login');
  };

  const onSkip = () => {
    !isFirstOnboardingDone && setIsFirstOnboardedDone(true);
    router.navigate('/anonymous-login');
  };

  return (
    <FlowModal
      currentScreenIndex={currentScreenIndex}
      onGoNext={handleGoToNextScreen}
      onFinish={handleOnFinishFlow}
      onGoBack={handleGoToPreviousScreen}
      collectedData={collectedData}
      onSkip={onSkip}
    >
      <OnboardingSecondPage />
      <OnboardingFirstPage />
      {/* <OnboardingThirdPage /> */}
      <OnboardingFourthPage />
    </FlowModal>
  );
}
