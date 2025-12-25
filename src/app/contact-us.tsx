import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import Icon from '@/components/icon';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import Toast from '@/components/toast';
import { Text } from '@/components/ui';
import { MailIcon } from '@/components/ui/assets/icons';
import CopyIcon from '@/components/ui/assets/icons/copy';
import { translate } from '@/core';
import { useClipboard } from '@/core/hooks/use-clipboard';

const ContactUs = () => {
  const emailAddress = 'exfitai@gmail.com';
  const { copyToClipboard } = useClipboard();
  const handleCopyEmail = () => {
    copyToClipboard(emailAddress);
    Toast.success(translate('general.copyText.copied'), {
      style: { marginTop: 50 },
      closeButton: true,
    });
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title={translate('settings.contactUs')} />

      <View className="p-6">
        <Text className="mb-6 text-charcoal-600">
          {translate('rootLayout.screens.contactUs.heading')}
        </Text>

        <View className="rounded-2xl bg-gray-100 px-4 py-6 shadow-xl shadow-gray-100 dark:bg-black dark:shadow-none">
          <Text className="mb-6 font-semibold-poppins text-lg text-charcoal-600">
            {translate('rootLayout.screens.contactUs.customerSupport')}
          </Text>

          <View className="flex-row items-center gap-3">
            <Icon
              icon={<MailIcon />}
              size={24}
              color="#4E52FB"
              containerStyle="bg-primary-200 dark:bg-blackEerie p-3 rounded-full"
            />
            <View className="flex-col">
              <Text className="font-medium-poppins text-sm text-charcoal-600  dark:text-charcoal-200">
                {translate('rootLayout.screens.contactUs.emailAddress')}
              </Text>
              <Text className="font-medium-poppins">{emailAddress}</Text>
            </View>
            <TouchableOpacity
              onPress={handleCopyEmail}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CopyIcon
                top={8}
                left={4}
                color={'#4E52FB'}
                width={20}
                height={20}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ContactUs;
