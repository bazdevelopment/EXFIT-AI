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
import { useSelectedLanguage } from '@/core/i18n';

import { type IFitnessGoalScreen } from './fitness-goal-screen.interface';

// Define the main screen component
const FitnessGoalScreen = ({
  totalSteps,
  goToNextScreen,
  currentScreenIndex,
  goToPreviousScreen,
  onSkip,
  isSubmitOnboardingLoading,
}: IFitnessGoalScreen) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
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
  ];

  // Function to handle selecting/deselecting multiple goals
  const handleSelectGoal = (goalId: string) => {
    setSelectedGoals((prevSelectedGoals) => {
      if (prevSelectedGoals.includes(goalId)) {
        // If already selected, remove it
        return prevSelectedGoals.filter((id) => id !== goalId);
      } else {
        // If not selected, add it
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
          <View className="flex-row items-center">
            <Icon
              icon={<ArrowLeft />}
              iconContainerStyle="items-center p-3 justify-center rounded-2xl bg-gray-800"
              size={24}
              color={colors.white}
              onPress={goToPreviousScreen}
            />

            <Greeting userName={userInfo.userName} showGreeting={false} />
          </View>
          <View className="rounded-full bg-[#172554] px-3 py-1">
            <Text className="text-sm font-medium text-[#3195FD]">{`${currentScreenIndex + 1} of ${totalSteps}`}</Text>
          </View>
        </View>

        {/* Main Question */}
        <View className="mb-6 mt-8 px-4">
          <Text className="font-bold-poppins text-3xl text-white">
            What's your fitness goal?
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
          label="Continue"
          icon={<ArrowRight color={colors.white} />}
          withGradientBackground
          disabled={selectedGoals.length === 0}
          className=""
          textClassName="text-white text-center text-lg font-semibold"
          onPress={() => {
            goToNextScreen({
              fitnessGoals: selectedGoals,
            } as IOnboardingCollectedData);
          }}
        />
        <Button
          label="Skip"
          loading={isSubmitOnboardingLoading}
          variant="default"
          className="mt-4 h-[55px] justify-center rounded-3xl bg-[#042140]"
          textClassName="font-semibold-poppins text-lg text-center color-[#3195FD]"
          onPress={onSkip}
        />
      </View>
    </ScreenWrapper>
  );
};

export default FitnessGoalScreen; // Export the main screen component
