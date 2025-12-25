import React from 'react';
import { Linking, View } from 'react-native';

import EdgeCaseTemplate from '@/components/edge-case-template';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import { Button } from '@/components/ui';
import { RatingIllustration } from '@/components/ui/assets/illustrations';
import { DEVICE_TYPE, translate } from '@/core';

const Rate = () => {
  const handleFeedback = (isPositive: boolean) => {
    if (isPositive) {
      // Redirect happy users to the App Store
      const storeUrl = DEVICE_TYPE.IOS
        ? 'itms-apps://itunes.apple.com/app/viewContentsUserReviews/id6749510101?action=write-review'
        : 'market://details?id=com.exfit&showAllReviews=true';
      Linking.openURL(storeUrl).catch((err) =>
        console.error('Error opening URL', err)
      );
    } else {
      // Redirect unhappy users to a Google Form
      const googleFormUrl = 'https://forms.gle/ZeAmDbLnpYtCfM8X6';
      Linking.openURL(googleFormUrl).catch((err) =>
        console.error('Error opening URL', err)
      );
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title={translate('settings.rate')} />
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
