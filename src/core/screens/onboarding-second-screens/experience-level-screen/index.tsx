// NativeWind is used implicitly for styling by applying className
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { type IOnboardingCollectedData } from '@/app/onboarding-second';
import Greeting from '@/components/greeting';
import SelectableButton from '@/components/selectable-button';
import { Button } from '@/components/ui';
import {
  ArrowRightRounded,
  BackRoundedIcon,
} from '@/components/ui/assets/icons';

import { type IExperienceLevelScreen } from './experience-level-screen.interface';

const ExperienceLevelScreen = ({
  totalSteps,
  currentScreenIndex,
  goToPreviousScreen,
  onFinish,
  onSkip,
  isSubmitOnboardingLoading,
}: IExperienceLevelScreen) => {
  // State for single selection of experience level
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Array of experience levels to display
  const experienceLevels = [
    { id: 'beginner', icon: '🐣', text: 'Beginner' }, // Using emojis for consistency
    { id: 'intermediate', icon: '💪', text: 'Intermediate' },
    { id: 'advance', icon: '🚀', text: 'Advance' },
  ];

  // Function to handle single selection of an experience level
  const handleSelectLevel = (levelId: string) => {
    setSelectedLevel(levelId);
  };

  return (
    // SafeAreaView for proper layout on iOS devices, StatusBar for dark content
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="mt-4 flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="size-10 items-center justify-center rounded-full bg-gray-800"
              onPress={goToPreviousScreen}
            >
              <BackRoundedIcon />
            </TouchableOpacity>

            <Greeting userName="Marian" showGreeting={false} />
          </View>

          <View className="rounded-full bg-[#172554] px-3 py-1">
            <Text className="text-sm font-medium text-[#3195FD]">{`${currentScreenIndex + 1} of ${totalSteps}`}</Text>
          </View>
        </View>

        {/* Main Question */}
        <View className="mb-6 mt-8 px-4">
          <Text className="text-3xl font-bold text-white">
            How would you describe your fitness experience?
          </Text>
        </View>

        {/* Selectable Buttons for experience levels */}
        <View className="flex-1">
          {experienceLevels.map((level) => (
            <SelectableButton
              key={level.id}
              icon={level.icon}
              text={level.text}
              isSelected={selectedLevel === level.id}
              onPress={() => handleSelectLevel(level.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Continue Button at the bottom */}
      <View className="bg-black px-4 py-6">
        <Button
          label="Continue"
          icon={<ArrowRightRounded />}
          loading={isSubmitOnboardingLoading}
          withGradientBackground
          disabled={!selectedLevel}
          className=""
          textClassName="text-white text-center text-lg font-semibold"
          onPress={() =>
            onFinish({ experience: selectedLevel } as IOnboardingCollectedData)
          }
        />
        <Button
          label="Skip"
          loading={false}
          variant="default"
          className="mt-4 h-[55px] justify-center rounded-3xl bg-[#042140]"
          textClassName="font-semibold-nunito text-lg text-center color-[#3195FD]"
          onPress={onSkip}
        />
      </View>
    </SafeAreaView>
  );
};

export default ExperienceLevelScreen; // Export the new screen component
