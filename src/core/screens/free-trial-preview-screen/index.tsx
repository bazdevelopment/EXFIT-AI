import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import Avatar from '@/components/avatar';
import FadeInView from '@/components/fade-in-view/fade-in-view';
import HorizontalLine from '@/components/horizontal-line';
import PremiumFeaturesOverview from '@/components/premium-features-overivew';
import { Button, colors } from '@/components/ui';
import { ArrowRightSharp } from '@/components/ui/assets/icons/arrow-right-sharp';
import { StarIcon } from '@/components/ui/assets/icons/star';
import useRemoteConfig from '@/core/hooks/use-remote-config';
import { useSecondOnboarding } from '@/core/hooks/use-second-onboarding';
import { translate } from '@/core/i18n';
import { DEVICE_TYPE } from '@/core/utilities/device-type';
import { requestAppRatingWithDelay } from '@/core/utilities/request-app-review';

// Social Proof Component
const SocialProofCard = () => (
  <View className="rounded-2xl border-[1.5px] border-primary-900 bg-primary-900/10 p-5 dark:bg-charcoal-900">
    <View className="mb-1 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="mr-3 size-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
          <Avatar
            image={require('../../../components/ui/assets/images/male-gym.jpg')}
            size="small"
            shape="circle"
          />
        </View>
        <View className="flex-row gap-4">
          <Text className="font-bold-poppins text-base text-gray-900 dark:text-white">
            Chris A.
          </Text>
          <View className="flex-row gap-1">
            <StarIcon color={colors.warning[400]} fill={colors.warning[400]} />
            <StarIcon color={colors.warning[400]} fill={colors.warning[400]} />
            <StarIcon color={colors.warning[400]} fill={colors.warning[400]} />
            <StarIcon color={colors.warning[400]} fill={colors.warning[400]} />
            <StarIcon color={colors.warning[400]} fill={colors.warning[400]} />
          </View>
        </View>
      </View>
    </View>

    <Text className="font-semibold-poppins text-base leading-5 dark:text-white">
      {translate('rootLayout.screens.freeTrialPreview.review')}
    </Text>
    <Text className="mt-2 text-sm text-gray-900 dark:text-white">
      {translate('rootLayout.screens.freeTrialPreview.reviewTrust')}
    </Text>
  </View>
);

const FreeTrialPreview = ({ onFinish }) => {
  const { SHOW_SOCIAL_PROOF_ONBOARDING } = useRemoteConfig();
  const [isSecondOnboardingDone, setIsSecondOnboardingDone] =
    useSecondOnboarding();

  useEffect(() => {
    requestAppRatingWithDelay(500);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-transparent">
      <ScrollView
        className={`px-5 ${DEVICE_TYPE.ANDROID && 'pt-[42]'}`}
        contentContainerClassName={`${DEVICE_TYPE.ANDROID ? 'pb-20' : ''}`}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 text-center font-bold-poppins text-4xl text-primary-900 dark:text-primary-500">
          {translate('rootLayout.screens.freeTrialPreview.heading')}
        </Text>

        {SHOW_SOCIAL_PROOF_ONBOARDING && (
          <FadeInView delay={100}>
            <SocialProofCard />
          </FadeInView>
        )}
        <HorizontalLine className="mb-3 mt-4" />
        <PremiumFeaturesOverview />
      </ScrollView>
      {/* Bottom Navigation */}
      <View className="bottom-16 px-6">
        <Button
          label={translate('general.continue')}
          variant="default"
          className="h-[55px] rounded-full bg-primary-900 pl-5 dark:bg-primary-900"
          textClassName="font-semibold-poppins text-lg dark:text-white "
          iconPosition="right"
          icon={<ArrowRightSharp color={colors.white} />}
          onPress={() => {
            !isSecondOnboardingDone && setIsSecondOnboardingDone(true);
            router.navigate({
              pathname: '/paywall-new',
              params: { allowAppAccess: true },
            });
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default FreeTrialPreview;
