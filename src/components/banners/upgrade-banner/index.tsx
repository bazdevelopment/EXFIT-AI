import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { UpgradeProgress } from '@/components/ui/assets/icons/upgrade-progress';

const UpgradeBanner = ({
  additionalClassName,
}: {
  additionalClassName?: string;
}) => {
  const handleUpgrade = () => {
    router.push({
      pathname: '/paywall',
      params: { showFreeTrialOffering: 'false', allowToNavigateBack: 'true' },
    });
  };
  return (
    <View className={`mx-4 mb-6 ${additionalClassName}`}>
      <View className="relative overflow-hidden rounded-2xl bg-green-500 p-4 pb-2">
        <View className="flex-row items-center">
          <UpgradeProgress width={70} height={70} />
          <View className="ml-3 flex-1">
            <Text className="mb-1 font-bold-poppins text-lg text-white">
              Upgrade to EXFIT AI PRO
            </Text>
            <Text className="font-medium-poppins text-sm text-green-100">
              AI features. All premium tools. All yours to stay on track.
            </Text>
          </View>
        </View>

        <Button
          label="Upgrade Now"
          className="mt-3 h-[34px] rounded-full bg-white active:opacity-90"
          textClassName="text-black font-medium-poppins"
          onPress={handleUpgrade}
        />
      </View>
    </View>
  );
};
export default UpgradeBanner;
