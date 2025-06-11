import { router } from 'expo-router';
import React, { useState } from 'react';

import FlowModal from '@/components/flow-modal';
import OnboardingFirstPage from '@/core/screens/onboarding-first-screens/onboarding-first-page';
import OnboardingFourthPage from '@/core/screens/onboarding-first-screens/onboarding-fourth-page';
import OnboardingSecondPage from '@/core/screens/onboarding-first-screens/onboarding-second-page';
import OnboardingThirdPage from '@/core/screens/onboarding-first-screens/onboarding-third-page';

export interface IOnboardingCollectedData {
  preferredName: string;
}

export default function OnboardingFirst() {
  const [collectedData, setCollectedData] = useState<IOnboardingCollectedData>({
    preferredName: '',
  });
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

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
    router.navigate('/anonymous-login');
    // ! update local storage with isFirstOnboardingDone
  };

  const onSkip = () => {
    /**Navigate to the onboarding */
    router.navigate('/anonymous-login');
    // ! update local storage with isFirstOnboardingDone
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
      <OnboardingThirdPage />
      <OnboardingFourthPage />
    </FlowModal>
  );
}
