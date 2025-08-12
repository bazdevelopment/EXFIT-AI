import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { type CustomerInfo } from 'react-native-purchases';

import {
  useGetOfferings,
  usePurchaseSubscription,
  useRestorePurchases,
  useStartFreeTrial,
} from '@/api/subscription/subscription.hooks';
import { useUpdateUser, useUser } from '@/api/user/user.hooks';
import PricingOption from '@/components/pricing-option';
import { Button, colors, FocusAwareStatusBar, Text } from '@/components/ui';
import { CloseIcon } from '@/components/ui/assets/icons';
import { MAX_FREE_SCANS } from '@/constants/limits';
import { SUBSCRIPTION_PLANS_PER_PLATFORM } from '@/constants/subscriptions';
import { translate } from '@/core';
import { calculateAnnualDiscount } from '@/core/utilities/calculate-annual-discout';
import { updateUserAfterSelectingPlan } from '@/core/utilities/update-user-subscription-plan';
import { wait } from '@/core/utilities/wait';

const formatPaywallData = (offerings: any, showFreeTrialOffering: string) => {
  const paywallData = [];

  if (showFreeTrialOffering === 'true') {
    paywallData.push({
      id: 'free_trial',
      title: translate(
        'rootLayout.screens.paywallUpgradeScreen.firstOffering.title'
      ),
      subtitle: translate(
        'rootLayout.screens.paywallUpgradeScreen.firstOffering.subtitle',
        { freeScans: MAX_FREE_SCANS }
      ),
      price: 'Free',
      priceNumber: '',
      currency: '',
      type: 'FREE_TRIAL',
    });
  }
  if (!offerings) return paywallData;

  if (offerings?.monthly?.product) {
    paywallData.push({
      id: offerings.monthly.product.identifier,
      title: translate(
        'rootLayout.screens.paywallUpgradeScreen.secondOffering.title'
      ),
      subtitle: translate(
        'rootLayout.screens.paywallUpgradeScreen.secondOffering.subtitle',
        {
          price: offerings.monthly.product.priceString,
        }
      ),
      price: offerings.monthly.product.priceString,
      priceNumber: offerings.monthly.product.price,
      currency: offerings.monthly.product.currencyCode,
      type: 'MONTHLY',
    });
  }

  if (offerings?.annual?.product) {
    paywallData.push({
      id: offerings.annual.product.identifier,
      title: translate(
        'rootLayout.screens.paywallUpgradeScreen.thirdOffering.title'
      ),
      subtitle: translate(
        'rootLayout.screens.paywallUpgradeScreen.thirdOffering.subtitle',
        {
          price: offerings.annual.product.priceString,
        }
      ),
      price: offerings.annual.product.priceString,
      priceNumber: offerings.annual.product.price,
      currency: offerings.annual.product.currencyCode,
      type: 'ANNUAL',
    });
  }

  return paywallData;
};

// eslint-disable-next-line max-lines-per-function
const Paywall = () => {
  const features = [
    translate(
      'rootLayout.screens.paywallOnboarding.freeTierOfferings.firstOffering'
    ),
    translate(
      'rootLayout.screens.paywallOnboarding.freeTierOfferings.thirdOffering'
    ),
    translate(
      'rootLayout.screens.paywallOnboarding.freeTierOfferings.fourthOffering'
    ),
    translate(
      'rootLayout.screens.paywallOnboarding.freeTierOfferings.secondOffering'
    ),
  ];
  const {
    i18n: { language },
  } = useTranslation();
  const { data: userInfo } = useUser(language);
  const { showFreeTrialOffering = 'true', allowToNavigateBack = 'false' } =
    useLocalSearchParams();
  const { mutateAsync: onUpdateUser, isPending: isPendingUpdateUser } =
    useUpdateUser();

  const { mutate: onHandleFreeTrial, isPending: isPendingFreeTrialRequest } =
    useStartFreeTrial();

  const [selectedPlan, setSelectedPlan] = useState(
    SUBSCRIPTION_PLANS_PER_PLATFORM?.YEARLY
  );

  const onSuccessRestoration = async (fieldsToUpdate: object) => {
    await onUpdateUser({ language, userId: userInfo.userId, fieldsToUpdate });
  };

  const { mutateAsync: purchaseSubscription } = usePurchaseSubscription();
  const { data: offerings } = useGetOfferings();
  const formattedOfferings = formatPaywallData(
    offerings,
    showFreeTrialOffering
  );
  const { mutate: restorePurchase, isPending: isPendingRestorePurchase } =
    useRestorePurchases(onSuccessRestoration);

  const pricePerMonth = formattedOfferings.find(
    (item) => item.id === SUBSCRIPTION_PLANS_PER_PLATFORM?.MONTHLY
  )?.priceNumber;

  const pricePerYear = formattedOfferings.find(
    (item) => item.id === SUBSCRIPTION_PLANS_PER_PLATFORM?.YEARLY
  )?.priceNumber;

  const discount = calculateAnnualDiscount(pricePerMonth, pricePerYear);
  const onSelect = (planId: string) => setSelectedPlan(planId);

  const handlePurchase = async () => {
    if (selectedPlan === 'free_trial') {
      onHandleFreeTrial({});

      //add here the logic to start the trial
    } else {
      const customerInfoAfterPurchase = await purchaseSubscription({
        packageIdentifier: selectedPlan,
      });

      await updateUserAfterSelectingPlan({
        language,
        userId: userInfo.userId,
        collectedData: { preferredName: userInfo.userName },
        customerInfo: customerInfoAfterPurchase as CustomerInfo,
        onUpdateUser,
      });

      wait(2000).then(() => router.navigate('/(app)'));
    }
  };

  return (
    // <SafeAreaView className="flex-1">
    <View
      className={`-mb-32 flex-1 bg-black ${allowToNavigateBack === 'true' ? 'pt-12' : 'pt-16'}`}
    >
      <FocusAwareStatusBar hidden />

      {/* Liquid Background Image */}
      <ImageBackground
        source={require('../components/ui/assets/images/liquid-purple.jpg')}
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          opacity: 0.3, // Adjust opacity as needed (0.5-0.8 works well)
        }}
        resizeMode="cover"
      >
        {/* Dark overlay to enhance readability */}
      </ImageBackground>

      <ScrollView
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {allowToNavigateBack === 'true' && (
          <View className="top-[5] flex-row justify-end p-4">
            <TouchableOpacity
              className="size-10 items-center justify-center"
              onPress={() =>
                allowToNavigateBack === 'true'
                  ? router.back()
                  : router.navigate('/(app)')
              }
              activeOpacity={0.7}
            >
              <CloseIcon color={colors.white} width={28} height={28} />
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <View className="px-6">
          {/* Title */}
          <Text className="mb-10 mt-4 text-center font-semibold-poppins text-3xl text-white">
            {translate(
              'rootLayout.screens.paywallOnboarding.freeTierOfferings.title'
            )}
          </Text>

          {/* Features */}
          <View className="mb-2">
            {features.map((feature, index) => (
              <View key={index} className="mb-4 w-[90%] flex-row items-center">
                <View className="mr-5 size-7 items-center justify-center rounded-full bg-blue-500">
                  <Ionicons name="checkmark" size={18} color="white" />
                </View>
                <Text className="font-primary-poppins text-base text-white dark:text-white">
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Pricing Options Container with Glassmorphism */}
          <View className="mb-10 gap-3">
            {formattedOfferings.map((plan) => (
              <PricingOption
                key={plan.id}
                plan={plan}
                selectedPlan={selectedPlan}
                onSelectOption={() => onSelect(plan.id)}
                badge={
                  discount &&
                  plan.type === 'ANNUAL' &&
                  `${translate('general.saveDiscount')} ${discount}`
                }
              />
            ))}
          </View>

          {/* Continue Button */}
          <Button
            label={translate('general.continue')}
            variant="default"
            disabled={!selectedPlan || !formattedOfferings?.length}
            className="h-[55px] w-full rounded-full bg-[#3B82F6] pl-5 active:bg-primary-700 dark:bg-primary-900"
            textClassName="text-base text-center text-white dark:text-white"
            iconPosition="left"
            onPress={handlePurchase}
            loading={isPendingUpdateUser || isPendingFreeTrialRequest}
          />

          {/* Restore Purchase Button */}
          <Button
            label={translate('general.restorePurchase')}
            variant="ghost"
            className="self-center active:opacity-70"
            textClassName="text-white font-medium"
            onPress={restorePurchase}
            loading={isPendingRestorePurchase}
          />
        </View>
        {/* </SafeAreaView> */}
      </ScrollView>
    </View>
    // </SafeAreaView>
  );
};

export default Paywall;
