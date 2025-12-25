import { router } from 'expo-router';
import React, { useState } from 'react';

import { useUpdateUser, useUser } from '@/api/user/user.hooks';
import FlowModal from '@/components/flow-modal';
import { useSelectedLanguage } from '@/core';
import { useSecondOnboarding } from '@/core/hooks/use-second-onboarding';
import FreeTrialPreview from '@/core/screens/free-trial-preview-screen';

export interface IOnboardingCollectedData {
  gender: string;
  fitnessGoals: string[];
  experience: string;
}

export default function OnboardingSecond() {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const [isSecondOnboardingDone, setIsSecondOnboardingDone] =
    useSecondOnboarding();

  const { mutateAsync: onUpdateUser, isPending: isSubmitOnboardingLoading } =
    useUpdateUser();
  const [collectedData, setCollectedData] = useState<IOnboardingCollectedData>({
    gender: '',
    fitnessGoals: [],
    experience: '',
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

  const handleOnFinishFlow = async (
    newCollectedData: IOnboardingCollectedData
  ) => {
    const payload = {
      onboarding: { ...collectedData, ...newCollectedData },
      isOnboarded: true,
    };
    setCollectedData((prevCollectedData) => ({
      ...prevCollectedData,
      ...newCollectedData,
    }));

    await onUpdateUser({
      language,
      userId: userInfo.userId,
      fieldsToUpdate: payload,
    }).then(() => {
      !isSecondOnboardingDone && setIsSecondOnboardingDone(true);
      // router.navigate('/(app)');
      router.navigate({
        pathname: '/paywall-new',
        params: { allowAppAccess: true },
      });
    });
  };

  const onSkip = async () => {
    const payload = {
      onboarding: collectedData,
      isOnboarded: true,
    };
    await onUpdateUser({
      language,
      userId: userInfo.userId,
      fieldsToUpdate: payload,
    }).then(() => {
      !isSecondOnboardingDone && setIsSecondOnboardingDone(true);
      // router.navigate('/(app)');
      router.navigate({
        pathname: '/paywall-new',
        params: { allowAppAccess: true },
      });
    });
  };

  return (
    <FlowModal
      currentScreenIndex={currentScreenIndex}
      onGoNext={handleGoToNextScreen}
      onFinish={handleOnFinishFlow}
      onGoBack={handleGoToPreviousScreen}
      collectedData={collectedData}
      onSkip={onSkip}
      isSubmitOnboardingLoading={isSubmitOnboardingLoading}
    >
      {/* <GenderSelectionScreen />
      <FitnessGoalScreen />
      <ExperienceLevelScreen /> */}
      <FreeTrialPreview />
    </FlowModal>
  );
}
