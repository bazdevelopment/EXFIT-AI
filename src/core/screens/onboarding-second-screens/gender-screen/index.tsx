import React, { useState } from 'react';
import { View } from 'react-native';

import { useUser } from '@/api/user/user.hooks';
import { type IOnboardingCollectedData } from '@/app/onboarding-second';
import GenderCard from '@/components/gender-card';
import Greeting from '@/components/greeting';
import ScreenWrapper from '@/components/screen-wrapper';
import { Button, colors, Text } from '@/components/ui';
import { ArrowRight } from '@/components/ui/assets/icons';
import { useSelectedLanguage } from '@/core/i18n';

import { type IGenderScreen } from './gender-screen.interface';

type GenderType = 'male' | 'female' | null;

export default function GenderSelectionScreen({
  totalSteps,
  goToNextScreen,
  currentScreenIndex,
}: IGenderScreen) {
  const [selectedGender, setSelectedGender] = useState<GenderType>('male');
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

  const handleGenderSelect = (gender: GenderType) => {
    setSelectedGender(gender);
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className=" flex-1">
          <Greeting userName={userInfo?.userName} showGreeting={false} />
        </View>
        <View className="rounded-full bg-[#172554] px-3 py-1">
          <Text className="font-bold-poppins text-sm text-[#3195FD] dark:text-[#3195FD] ">{`${currentScreenIndex + 1} of ${totalSteps}`}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="px-6">
        {/* Title */}
        <Text className="mb-12 mt-4 text-center font-semibold-poppins text-2xl text-white">
          Select gender for a more tailored experience
        </Text>
      </View>
      <View className="gap-4 px-6">
        <GenderCard
          gender="male"
          title="Male"
          sourceImage={require('../../../../components/ui/assets/images/gender-male.png')}
          isSelected={selectedGender === 'male'}
          onGenderSelect={handleGenderSelect}
        />

        <GenderCard
          gender="female"
          title="Female"
          sourceImage={require('../../../../components/ui/assets/images/gender-female.png')}
          isSelected={selectedGender === 'female'}
          onGenderSelect={handleGenderSelect}
        />
      </View>

      <View className="mt-10 gap-2 px-6">
        <Button
          label="Continue"
          icon={<ArrowRight color={colors.white} />}
          className="h-14 rounded-full bg-[#4E52FB] dark:bg-[#4E52FB]"
          textClassName="text-white dark:text-white text-center font-medium-poppins"
          onPress={() =>
            goToNextScreen({
              gender: selectedGender,
            } as IOnboardingCollectedData)
          }
        />
      </View>
    </ScreenWrapper>
  );
}
