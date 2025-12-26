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
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

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
    <ScreenWrapper>
      <ScrollView className="mt-6 flex-1">
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
            {translate('rootLayout.screens.experienceLevelScreen.heading')}
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
          label={translate('general.continue')}
          icon={<ArrowRight color={colors.white} />}
          loading={isSubmitOnboardingLoading}
          disabled={!selectedLevel}
          className="h-14 rounded-full bg-[#4E52FB] dark:bg-[#4E52FB]"
          textClassName="text-white text-center text-base font-medium-poppins dark:text-white"
          onPress={() =>
            onFinish({ experience: selectedLevel } as IOnboardingCollectedData)
          }
        />
        <Button
          label={translate('general.skip')}
          loading={false}
          className="mt-2 h-[50px] justify-center rounded-full bg-[#042140] dark:bg-[#042140]"
          textClassName="font-medium-poppins text-base text-center text-[#3195FD] dark:text-[#3195FD]"
          onPress={onSkip}
        />
      </View>
    </ScreenWrapper>
  );
};

export default ExperienceLevelScreen; // Export the new screen component
