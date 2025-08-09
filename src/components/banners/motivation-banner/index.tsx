import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import CustomAlert from '@/components/custom-alert';
import Toast from '@/components/toast';
import { Button, colors, Text } from '@/components/ui';
import { MotivationIcon } from '@/components/ui/assets/icons/motivation';
import { translate } from '@/core';

const MotivationBanner = ({
  containerClassName,
  isUpgradeRequired,
}: {
  containerClassName?: string;
  isUpgradeRequired: boolean;
}) => {
  const handleNavigateToExcuseBuster = () => {
    if (isUpgradeRequired) {
      return Toast.showCustomToast(
        <CustomAlert
          title={translate('general.attention')}
          subtitle={
            'Upgrade to premium to use this feature —  Enjoy advanced AI tools, exclusive features, and everything you need to stay ahead, all in one place.'
          }
          buttons={[
            {
              label: translate('components.UpgradeBanner.heading'),
              variant: 'default',
              onPress: () =>
                router.push({
                  pathname: '/paywall',
                  params: {
                    showFreeTrialOffering: 'false',
                    allowToNavigateBack: 'true',
                  },
                }),
              buttonTextClassName: 'dark:text-white',
              className:
                'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
            },
          ]}
        />,
        {
          duration: 10000000,
        }
      );
    }
    router.navigate('/excuse-buster');
  };
  return (
    <View
      className={`relative w-full self-center overflow-hidden rounded-3xl bg-[#2A2D3A] shadow-lg ${containerClassName} `}
    >
      <View className="flex-row items-center p-3">
        {/* Brain Icon */}
        <View className="mr-4 h-full w-[80px] flex-row items-center justify-center rounded-xl bg-[#191A21]">
          <MotivationIcon width={40} height={40} fill={colors.white} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-md font-semibold-poppins text-white">
            No Motivation? Feeling off? Let's beat that excuse.
          </Text>

          <Text className="mt-2 text-sm text-gray-300">
            Quick way to earn XP and gems—let’s go!
          </Text>

          <View className="mt-2">
            <Button
              label="Beat your excuse now!"
              className="h-[34px] rounded-full bg-white active:opacity-90"
              textClassName="text-black font-medium-poppins"
              onPress={handleNavigateToExcuseBuster}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default MotivationBanner;
