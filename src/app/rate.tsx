import { router } from 'expo-router';
import React from 'react';
import { Linking, View } from 'react-native';

import EdgeCaseTemplate from '@/components/edge-case-template';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { Button, colors, Text } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';
import { RatingIllustration } from '@/components/ui/assets/illustrations';
import { DEVICE_TYPE, translate } from '@/core';

const Rate = () => {
  const handleFeedback = (isPositive: boolean) => {
    if (isPositive) {
      // Redirect happy users to the App Store
      const storeUrl = DEVICE_TYPE.IOS ? '' : '';
      Linking.openURL(storeUrl).catch((err) =>
        console.error('Error opening URL', err)
      );
    } else {
      // Redirect unhappy users to a Google Form
      const googleFormUrl = 'google form here';
      Linking.openURL(googleFormUrl).catch((err) =>
        console.error('Error opening URL', err)
      );
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-row items-center gap-4 px-6">
        <Icon
          icon={<ArrowLeft />}
          iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
          size={24}
          color={colors.white}
          onPress={router.back}
        />
        <Text className="font-bold-poppins text-2xl text-white">
          Give us feedback
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <EdgeCaseTemplate
          image={<RatingIllustration />}
          title={translate('rootLayout.screens.rateAppScreen.heading')}
          additionalClassName="top-[-40] px-10"
        />

        <View className="bottom-10 mt-auto flex-row gap-4">
          {/* Negative Feedback Button */}
          <Button
            className="h-[56px] w-[160px] rounded-full bg-danger-500  active:bg-red-300 dark:bg-danger-500"
            onPress={() => handleFeedback(false)}
            textClassName="dark:text-white text-white font-medium-poppins"
            label={translate('rootLayout.screens.rateAppScreen.dislike')}
          />

          {/* Positive Feedback Button */}
          <Button
            className="h-[56px] w-[160px] rounded-full bg-[#4E52FB] active:bg-primary-700 dark:bg-[#4E52FB]"
            onPress={() => handleFeedback(true)}
            label={translate('rootLayout.screens.rateAppScreen.like')}
            textClassName="text-white dark:text-white font-medium-poppins"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Rate;
