// NativeWind is used implicitly for styling by applying className
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useUser } from '@/api/user/user.hooks';
import { type IOnboardingCollectedData } from '@/app/onboarding-second';
import Greeting from '@/components/greeting';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import SelectableButton from '@/components/selectable-button';
import { Button, colors } from '@/components/ui';
import { ArrowLeft, ArrowRight } from '@/components/ui/assets/icons';
import { translate, useSelectedLanguage } from '@/core/i18n';

import { type IFitnessGoalScreen } from './fitness-goal-screen.interface';

const MAX_SELECTED_GOALS = 4;

// Define the main screen component
const FitnessGoalScreen = ({
  totalSteps,
  goToNextScreen,
  currentScreenIndex,
  goToPreviousScreen,
  onSkip,
  isSubmitOnboardingLoading,
  collectedData,
}: IFitnessGoalScreen) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    collectedData.fitnessGoals ?? []
  );
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  // Array of fitness goals to display
  const fitnessGoals = [
    { id: 'gym_machines', icon: '🏋️', text: 'Learn Gym Machines' },
    { id: 'ai_coach', icon: '🤖', text: 'I wanna try AI Coach' },
    { id: 'build_strength', icon: '💪', text: 'Build Strength' },
    { id: 'gain_endurance', icon: '⚡', text: 'I wanna gain endurance' },
    { id: 'lose_weight', icon: '⚖️', text: 'I want to loose weight' },
    { id: 'practice_yoga', icon: '🧘', text: 'I want to practice yoga' },
    { id: 'home_workouts', icon: '🏠', text: 'Do Home Workouts' },
    { id: 'mental_health', icon: '🧠', text: 'Boost Mental Health' },
    { id: 'get_toned', icon: '🎯', text: 'Get Toned & Defined' },
    { id: 'gain_weight', icon: '🍽️', text: 'I want to gain weight' },
  ];

  // Function to handle selecting/deselecting multiple goals
  const handleSelectGoal = (goalId: string) => {
    setSelectedGoals((prevSelectedGoals) => {
      if (prevSelectedGoals.includes(goalId)) {
        // If already selected, remove it
        return prevSelectedGoals.filter((id) => id !== goalId);
      } else {
        // If max limit reached, prevent adding more
        if (prevSelectedGoals.length >= MAX_SELECTED_GOALS) {
          alert(`You can select up to ${MAX_SELECTED_GOALS} goals.`);
          return prevSelectedGoals;
        }
        // Otherwise, add the new goal
        return [...prevSelectedGoals, goalId];
      }
    });
  };

  return (
    // SafeAreaView for proper layout on iOS devices, StatusBar for dark content
    <ScreenWrapper>
      <ScrollView className="mt-4 flex-1">
        {/* Header Section */}
        <View className="flex-row items-center justify-between px-4">
          <View className="max-w-[70%] flex-1 flex-row items-center gap-4">
            <Icon
              icon={<ArrowLeft />}
              iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
              size={24}
              color={colors.white}
              onPress={goToPreviousScreen}
            />

            <Greeting userName={userInfo?.userName} showGreeting={false} />
          </View>
          <View className="rounded-full bg-[#172554] px-3 py-1">
            <Text className="font-bold-poppins text-sm text-[#3195FD]">{`${currentScreenIndex + 1} of ${totalSteps}`}</Text>
          </View>
        </View>

        {/* Main Question */}
        <View className="mb-6 mt-8 px-4">
          <Text className="font-bold-poppins text-3xl text-white">
            {translate('rootLayout.screens.fitnessGoalScreen.heading')}
          </Text>
        </View>

        {/* Selectable Buttons */}
        <View className="flex-1">
          {fitnessGoals.map((goal) => (
            <SelectableButton
              key={goal.id}
              icon={goal.icon}
              text={goal.text}
              isSelected={selectedGoals.includes(goal.id)}
              onPress={() => handleSelectGoal(goal.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Continue Button at the bottom */}
      <View className="bg-black px-4 py-6">
        <Button
          label={translate('general.continue')}
          icon={<ArrowRight color={colors.white} />}
          // withGradientBackground
          disabled={selectedGoals.length === 0}
          className="h-14 rounded-full bg-[#4E52FB] dark:bg-[#4E52FB]"
          textClassName="text-white text-center text-base font-medium-poppins dark:text-white"
          onPress={() => {
            goToNextScreen({
              fitnessGoals: selectedGoals,
            } as IOnboardingCollectedData);
          }}
        />
        <Button
          label={translate('general.skip')}
          loading={isSubmitOnboardingLoading}
          className="mt-2 h-[50px] justify-center rounded-full bg-[#042140] dark:bg-[#042140]"
          textClassName="font-medium-poppins text-base text-center text-[#3195FD] dark:text-[#3195FD]"
          onPress={onSkip}
        />
      </View>
    </ScreenWrapper>
  );
};

export default FitnessGoalScreen; // Export the main screen component
