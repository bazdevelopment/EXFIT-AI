/* eslint-disable max-lines-per-function */
import { router } from 'expo-router';
import { generateUniqueId } from 'functions/utilities/generate-unique-id';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import SelectableChip from '@/components/selectable-chip';
import { Button, colors, Image, Input, Text } from '@/components/ui';
import { ArrowLeft, WandSparkle } from '@/components/ui/assets/icons';
import useKeyboard from '@/core/hooks/use-keyboard';

const excuses = [
  'Too tired',
  'No time',
  'Too sore',
  'Gym is crowded',
  'Not feeling it',
  'Bad weather',
  'Work is crazy',
  "I'll start tomorrow",
  'Don’t know what to do',
  'No equipment',
];

const ExcuseBusterScreen = () => {
  const [selectedExcuses, setSelectedExcuses] = useState<string[]>([]);
  const [customExcuse, setCustomExcuse] = useState('');
  const { isKeyboardVisible } = useKeyboard();

  const scrollViewRef = useRef();

  const handleExcusePress = (excuse: string) => {
    if (selectedExcuses.includes(excuse)) {
      setSelectedExcuses(selectedExcuses.filter((e) => e !== excuse));
    } else {
      if (selectedExcuses.length < 3) {
        setSelectedExcuses([...selectedExcuses, excuse]);
      } else {
        Alert.alert(
          "Oops, looks like you're trying to set a world record for excuses! 😅 Maximum 3 excuses allowed - pick your top 3 and let's get moving!"
        );
      }
    }
  };
  useEffect(() => {
    if (isKeyboardVisible) {
      scrollViewRef?.current?.scrollToEnd({ animated: true }); // scrolls to bottom
      // OR if you want a fixed position:
      // scrollViewRef?.current?.scrollTo({ y: 500, animated: true });
    }
  }, [isKeyboardVisible]);
  const handleSubmit = () => {
    const allExcuses = [...selectedExcuses];
    if (customExcuse.trim()) {
      allExcuses.push(customExcuse.trim());
    }

    if (allExcuses.length === 0) {
      alert('Please select at least one excuse or enter a custom one!');
      return;
    }

    router.navigate({
      pathname: '/chat-excuse-buster',
      params: {
        conversationId: generateUniqueId(),
        mediaSource: '',
        mimeType: '',
        excuse: allExcuses,
        conversationMode: 'RANDOM_CONVERSATION',
      },
    });
  };

  const handleBackPress = () => {
    // Handle back navigation
    console.log('Back pressed');
  };

  const handleMenuPress = () => {
    // Handle menu press
    console.log('Menu pressed');
  };

  return (
    <ScreenWrapper>
      {/* <KeyboardAvoidingView
        className="flex-1"
        behavior={DEVICE_TYPE.IOS ? 'padding' : undefined}
      > */}
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        bottomOffset={0}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          <View className="z-100 flex-row items-center bg-[#0a1420] p-4">
            <Icon
              icon={<ArrowLeft />}
              iconContainerStyle="items-center p-2.5 justify-center rounded-full border-2 border-charcoal-800"
              size={24}
              color={colors.white}
              onPress={router.back}
            />

            <View className="ml-3 flex-row items-center">
              <View className="mr-3 items-center justify-center rounded-full">
                <Image
                  source={require('../components/ui/assets/images/excuse-buster-robot.jpg')}
                  className="size-[40] rounded-full"
                />
              </View>
              <View>
                <Text className="font-medium-poppins text-lg text-white">
                  Excuse Buster
                </Text>
                <View className="flex-row items-center gap-2">
                  <View className="size-2 rounded-full bg-success-400" />
                  <Text className="font-medium-poppins text-xs text-white">
                    Online
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="-z-10 mb-4 flex-1 justify-end px-6">
            {/* Main Content */}
            <View className="mb-8 mt-16 items-center">
              <Text className="mb-4 text-center font-medium-poppins text-lg text-white">
                You're Tougher Than Your Excuse.
              </Text>
              <Text className="text-center text-base text-white">
                What's holding you back today?
              </Text>
            </View>

            {/* Excuse Buttons Grid */}
            <View className="mb-6">
              <View className="flex-row flex-wrap items-center justify-center">
                {excuses.map((excuse, index) => (
                  <SelectableChip
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
              {/* <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust if you have a tab bar
              > */}
              <Input
                value={customExcuse}
                onChangeText={(text) => setCustomExcuse(text)}
                placeholder="Type your excuse here..."
                placeholderTextColor={colors.charcoal[300]}
                className="w-full rounded-xl bg-gray-800 p-4 pt-3 text-base text-white dark:text-white"
                multiline
                textAlignVertical="top"
                maxLength={700}
              />
              {/* </KeyboardAvoidingView> */}
            </View>

            {/* Submit Button */}
            <Button
              label="Crush my excuse"
              className="h-[45px] w-full rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
              textClassName="text-white dark:text-white disabled:text-white font-medium-poppins"
              onPress={handleSubmit}
              disabled={!selectedExcuses.length && !customExcuse.length}
              icon={<WandSparkle />}
            />
          </View>
          {/* </KeyboardAvoidingView> */}
        </View>
      </KeyboardAwareScrollView>
      {/* </KeyboardAvoidingView> */}
      {/* </KeyboardAvoidingView> */}
    </ScreenWrapper>
  );
};

export default ExcuseBusterScreen;
