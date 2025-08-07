import React from 'react';
import { Linking, View } from 'react-native';

import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { Button, Text } from '@/components/ui';
import { MobileIcon } from '@/components/ui/assets/icons/mobile-icon';
import { STORE_URLS } from '@/constants/stores-urls';
import { DEVICE_TYPE, translate } from '@/core';

const NewAppVersion = () => {
  const openAppStore = () => {
    // Determine the URL based on device type
    const storeUrl = DEVICE_TYPE.IOS ? STORE_URLS.IOS : STORE_URLS.ANDROID;

    // Try opening the appropriate URL
    Linking.openURL(storeUrl).catch((err) => {
      console.error('Error opening URL', err);

      // Provide feedback to the user in case of error
      alert(
        'We encountered an error while opening the store. Please try again later.'
      );
    });
  };
  return (
    <ScreenWrapper>
      <View className="flex-1 items-center justify-between">
        <View className="top-[-10%] mt-10 flex-1 items-center justify-center">
          <Icon icon={<MobileIcon />} />
          <Text className="mt-14 px-6 text-center font-medium-poppins text-[32px] text-white">
            {translate('rootLayout.screens.newAppVersionScreen.heading')}
          </Text>
          <Text className="mt-8 px-10 text-center text-lg text-white">
            {translate('rootLayout.screens.newAppVersionScreen.subheading')}
          </Text>
        </View>

        <Button
          label={translate('rootLayout.screens.newAppVersionScreen.action')}
          variant="default"
          className="bottom-14 mt-6 h-[52px] w-[90%] rounded-full border-2 border-primary-900 bg-[#4E52FB] pl-5 active:bg-primary-700 dark:bg-[#4E52FB]"
          textClassName="text-base text-center  dark:text-white"
          iconPosition="left"
          onPress={openAppStore}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewAppVersion;
