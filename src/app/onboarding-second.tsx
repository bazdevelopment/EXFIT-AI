import { router } from 'expo-router';
import React, { useState } from 'react';

import FlowModal from '@/components/flow-modal';
import ExperienceLevelScreen from '@/core/screens/onboarding-second-screens/experience-level-screen';
import FitnessGoalScreen from '@/core/screens/onboarding-second-screens/fitness-goal-screen';
import GenderSelectionScreen from '@/core/screens/onboarding-second-screens/gender-screen';

export interface IOnboardingCollectedData {
  gender: string;
  fitnessGoals: string[];
  experience: string;
}

export default function OnboardingSecond() {
  const [collectedData, setCollectedData] = useState<IOnboardingCollectedData>({
    gender: '',
    fitnessGoals: [],
    experience: '',
  });
  console.log('collectedData', collectedData);
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

  const handleOnFinishFlow = (newCollectedData: IOnboardingCollectedData) => {
    setCollectedData((prevCollectedData) => ({
      ...prevCollectedData,
      ...newCollectedData,
    }));
    router.navigate('/(app)');
  };

  const onSkip = () => {};

  return (
    <FlowModal
      currentScreenIndex={currentScreenIndex}
      onGoNext={handleGoToNextScreen}
      onFinish={handleOnFinishFlow}
      onGoBack={handleGoToPreviousScreen}
      collectedData={collectedData}
      onSkip={onSkip}
    >
      <GenderSelectionScreen />
      <FitnessGoalScreen />
      <ExperienceLevelScreen />
    </FlowModal>
  );
}
