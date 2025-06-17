import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';

import { type IOnboardingCollectedData } from '@/app/onboarding-second';
import GenderCard from '@/components/gender-card';
import Greeting from '@/components/greeting';
import { Button, Text } from '@/components/ui';
import { ArrowRightRounded } from '@/components/ui/assets/icons';

import { type IGenderScreen } from './gender-screen.interface';

type GenderType = 'male' | 'female' | null;

export default function GenderSelectionScreen({
  totalSteps,
  goToNextScreen,
  currentScreenIndex,
}: IGenderScreen) {
  const [selectedGender, setSelectedGender] = useState<GenderType>('male');

  const handleGenderSelect = (gender: GenderType) => {
    setSelectedGender(gender);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Greeting userName="Marian" showGreeting={false} />

        <View className="rounded-full bg-[#172554] px-3 py-1">
          <Text className="text-sm font-medium text-[#3195FD]">{`${currentScreenIndex + 1} of ${totalSteps}`}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="px-6">
        {/* Title */}
        <Text className="mb-12 mt-4 text-center text-2xl font-bold text-white">
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
          icon={<ArrowRightRounded />}
          withGradientBackground
          className=""
          textClassName="text-white text-center text-lg font-semibold"
          onPress={() =>
            goToNextScreen({
              gender: selectedGender,
            } as IOnboardingCollectedData)
          }
        />
      </View>
    </SafeAreaView>
  );
}
