import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import GradientText from '@/components/gradient-text';
import { Button, Input } from '@/components/ui';
import { BackRoundedIcon } from '@/components/ui/assets/icons';

interface ExcuseButtonProps {
  title: string;
  isSelected: boolean;
  onPress: () => void;
}

const ExcuseButton: React.FC<ExcuseButtonProps> = ({
  title,
  isSelected,
  onPress,
}) => {
  // Dynamic padding based on text length
  const getPadding = (text: string) => {
    if (text.length <= 8) return 'px-4 py-3';
    if (text.length <= 15) return 'px-5 py-3';
    return 'px-6 py-3';
  };

  const paddingClass = getPadding(title);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-full border border-gray-700  ${paddingClass} mx-1 mb-3 ${isSelected ? 'bg-[#3195FD]' : 'bg-gray-800'}`}
    >
      <Text className="text-center font-semibold-nunito text-sm text-white">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// eslint-disable-next-line max-lines-per-function
const ExcuseBusterScreen: React.FC = () => {
  const [selectedExcuses, setSelectedExcuses] = useState<string[]>([]);
  const [customExcuse, setCustomExcuse] = useState('');

  const excuses = [
    'No Time',
    'Too Tired',
    "Don't Know What To Do",
    'Gym is Crowded',
    'Bad Weather',
    'Feeling Unmotivated',
    'Feeling Stiff',
  ];

  const handleExcusePress = (excuse: string) => {
    if (selectedExcuses.includes(excuse)) {
      setSelectedExcuses(selectedExcuses.filter((e) => e !== excuse));
    } else {
      setSelectedExcuses([...selectedExcuses, excuse]);
    }
  };

  const handleSubmit = () => {
    const allExcuses = [...selectedExcuses];
    if (customExcuse.trim()) {
      allExcuses.push(customExcuse.trim());
    }
    console.log('allExcuses', allExcuses);

    if (allExcuses.length === 0) {
      alert('Please select at least one excuse or enter a custom one!');
      router.navigate('/chat-screen');

      return;
    }

    // Handle the submission logic here
    console.log('Selected excuses:', allExcuses);
    alert(`Time to bust these excuses: ${allExcuses.join(', ')}!`);
  };

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8 mt-4 flex-row items-center">
            <TouchableOpacity
              className="mr-4 size-12 items-center justify-center rounded-full bg-gray-800"
              activeOpacity={0.7}
              onPress={router.back}
            >
              <BackRoundedIcon />
            </TouchableOpacity>

            <GradientText colors={['#3195FD', '#666AFF']}>
              <Text className="text-center text-2xl font-bold text-blue-400">
                Excuse Buster
              </Text>
            </GradientText>
          </View>

          {/* Main Title */}
          <GradientText colors={['#3195FD', '#666AFF']} className="mb-6">
            <Text className="text-center text-2xl font-bold text-blue-400">
              Let's Bust Those Excuses!
            </Text>
          </GradientText>

          {/* Subtitle */}
          <Text className="mb-8 text-center font-semibold-nunito text-lg text-white">
            What's holding you back today, Marian?
          </Text>

          {/* Excuse Buttons Grid */}
          <View className="mb-6">
            <View className="flex-row flex-wrap items-center justify-center">
              {excuses.map((excuse, index) => (
                <ExcuseButton
                  key={excuse}
                  title={excuse}
                  isSelected={selectedExcuses.includes(excuse)}
                  onPress={() => handleExcusePress(excuse)}
                />
              ))}
            </View>
          </View>

          {/* Custom Input */}
          <View className="mb-8">
            <Input
              value={customExcuse}
              onChangeText={setCustomExcuse}
              placeholder="Or tell me what you feel...."
              placeholderTextColor="#6B7280"
              className="px-6 pb-4 pt-3 text-base text-white"
              containerClassName="border-2 border-charcoal-800"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <View className="self-center">
            <Button
              label="Submit"
              withGradientBackground
              className="h-[30px] w-[200] rounded-xl"
              textClassName="text-white font-bold-nunito"
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ExcuseBusterScreen;
