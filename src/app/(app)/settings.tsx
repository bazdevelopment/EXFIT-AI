/* eslint-disable max-lines-per-function */
import { useScrollToTop } from '@react-navigation/native';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useRef } from 'react';
import { Linking } from 'react-native';

import { useUploadPrivacyPolicy } from '@/api/privacy-policy/privacy-policy.hooks';
import {
  useSendGlobalPushNotifications,
  useSendIndividualPushNotification,
} from '@/api/push-notifications/push-notifications.hooks';
import { useAddFieldsToCollection } from '@/api/services/services.hooks';
import { seedShopItems } from '@/api/shop/shop.requests';
import { useUploadTermsOfService } from '@/api/terms-of-service/terms-of-service.hooks';
import { useDeleteAccount, useUpdateUser } from '@/api/user/user.hooks';
import { logout } from '@/api/user/user.requests';
import CustomAlert from '@/components/custom-alert';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ShareItem } from '@/components/settings/share-item';
import { ThemeItem } from '@/components/settings/theme-item';
import Toast from '@/components/toast';
import { Button, colors, ScrollView, Text, View } from '@/components/ui';
import { LogoutIcon, Rate } from '@/components/ui/assets/icons';
import { DeactivateIcon } from '@/components/ui/assets/icons/deactivate-icon';
import { translate, useIsFirstTime, useSelectedLanguage } from '@/core';
import { Env } from '@/core/env';
import { useFirstOnboarding } from '@/core/hooks/use-first-onboarding';
import useRemoteConfig from '@/core/hooks/use-remote-config';
import { useSecondOnboarding } from '@/core/hooks/use-second-onboarding';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';

export default function Settings() {
  const { colorScheme } = useColorScheme();
  const { language } = useSelectedLanguage();

  const { mutateAsync: onUpdateUser, isPending: isPendingUpdateUser } =
    useUpdateUser();
  const { isUpgradeRequired } = useSubscriptionAlert();

  const { SHOW_FAQ_SCREEN, SHOW_RATE_SCREEN } = useRemoteConfig();

  const scrollViewRef = useRef(null);
  const iconColor = colorScheme === 'dark' ? colors.neutral[50] : colors.black;

  const { mutate: onHandleGlobalPushNotifications } =
    useSendGlobalPushNotifications();

  const { mutate: onAddFieldsToCollection } = useAddFieldsToCollection();

  const { mutate: onHandleIndividualNotification } =
    useSendIndividualPushNotification();
  useScrollToTop(scrollViewRef);

  const { mutate: onUploadTermsOfService } = useUploadTermsOfService();
  const { mutate: onUploadPrivacyPolicy } = useUploadPrivacyPolicy();
  const { mutate: onDeleteAccount, isPending: isPendingDeleteAccount } =
    useDeleteAccount();

  const [, setIsFirstTime] = useIsFirstTime();
  const [, setIsFirstOnboardingDone] = useFirstOnboarding();
  const [, setIsSecondOnboardingDone] = useSecondOnboarding();

  const handleOnDeleteAccount = () => {
    onDeleteAccount({});
    setIsFirstTime(true);
    setIsFirstOnboardingDone(false);
    setIsSecondOnboardingDone(false);
  };

  const handleDeleteAccount = () => {
    Toast.showCustomToast(
      <CustomAlert
        visible
        title={translate('settings.deleteAccount')}
        subtitle={translate('settings.deleteAccountQuestion')}
        buttons={[
          {
            label: translate('general.close'),
            variant: 'default',
            onPress: () => Toast.dismiss(),
            className:
              'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
            buttonTextClassName: 'text-white dark:text-white text-sm',
          },
          {
            label: translate('general.delete'),
            variant: 'destructive',
            className: 'h-[48] flex-1 rounded-full',
            onPress: handleOnDeleteAccount,
          },
        ]}
      />,
      {
        duration: 10000000,
      }
    );
  };

  const handleLogout = async () => {
    Toast.showCustomToast(
      <CustomAlert
        visible
        title={translate('general.attention')}
        subtitle={translate('alerts.logoutQuestion')}
        image={
          <Icon
            size={24}
            containerStyle="rounded-full bg-red-500 size-[50] items-center justify-center"
            onPress={router.back}
            icon={<LogoutIcon color={colors.white} />}
          />
        }
        buttons={[
          {
            label: translate('general.close'),
            variant: '',
            onPress: () => Toast.dismiss(),
            className:
              'flex-1 rounded-full h-[48] bg-slate-100 active:opacity-80',
            buttonTextClassName: 'text-black font-medium-poppins',
          },
          {
            label: translate('general.yes'),
            variant: '',
            buttonTextClassName: 'text-white dark:text-white',
            className:
              'rounded-full flex-1 h-[48] bg-red-600 active:opacity-80',
            onPress: async () => {
              try {
                logout();
              } catch (error) {
                Toast.error(translate('alerts.logoutUnsuccessful'));
              }
            },
          },
        ]}
      />,
      {
        // position: "bottom-center", // Place the alert in the middle of the screen
        duration: 10000000,
      }
    );
  };

  return (
    <ScreenWrapper>
      {/* {DEVICE_TYPE.IOS && (
        <Toaster autoWiggleOnUpdate="toast-change" pauseWhenPageIsHidden />
      )} */}
      <View className="px-6">
        <Text className="mb-2 font-bold-poppins text-3xl text-white">
          {translate('settings.tab')}
        </Text>
      </View>
      <View className="flex-1">
        <ScrollView ref={scrollViewRef}>
          <View className="mb-20 px-6">
            <ItemsContainer title="settings.generale">
              <Item
                text="settings.profile"
                onPress={() => router.navigate('/profile')}
              />
              <Item
                text="settings.shop"
                onPress={() => router.navigate('/shop')}
              />
              <LanguageItem />
              <ThemeItem />
              <Item
                text="settings.contactUs"
                onPress={() => router.navigate('/contact-us')}
              />
            </ItemsContainer>

            <ItemsContainer title="settings.about">
              <Item text="settings.app_name" value={Env.NAME} />
              <Item text="settings.version" value={Env.VERSION} />
            </ItemsContainer>

            <ItemsContainer title="settings.support_us">
              <ShareItem />

              {SHOW_RATE_SCREEN && (
                <Item
                  text="settings.rate"
                  icon={<Rate color={iconColor} />}
                  onPress={() => router.navigate('/rate')}
                />
              )}
            </ItemsContainer>

            <ItemsContainer title="settings.links">
              <Item
                text="settings.privacy"
                onPress={() =>
                  Linking.openURL('https://exfitai-privacy.netlify.app/')
                }
              />
              <Item
                text="settings.terms"
                onPress={() =>
                  Linking.openURL(
                    'https://exfitai-terms-conditions.netlify.app/'
                  )
                }
              />
              {SHOW_FAQ_SCREEN && (
                <Item
                  text="settings.faq"
                  onPress={() => console.log('go to faq screen')}
                />
              )}
            </ItemsContainer>

            <Button
              label={translate('settings.logout')}
              icon={<LogoutIcon width={30} height={30} />}
              variant="destructive"
              className="mt-4 h-[48px] rounded-full active:opacity-80"
              textClassName="font-medium-poppins text-base"
              iconPosition="left"
              onPress={handleLogout}
            />

            <Button
              label={translate('settings.deactivateAccount')}
              icon={
                <DeactivateIcon width={30} height={30} color={colors.white} />
              }
              loading={isPendingDeleteAccount}
              variant="outline"
              className="mt-4 h-[48px] rounded-full active:opacity-80"
              textClassName="font-medium-poppins text-base"
              iconPosition="left"
              onPress={handleDeleteAccount}
            />

            {__DEV__ && ( //change the condition here so this will be available in dev/prod only for an admin account
              <>
                <ItemsContainer title="settings.devMode.title">
                  <Item
                    text="settings.devMode.componentsLibrary"
                    onPress={() => router.navigate('/ui-library')}
                  />
                </ItemsContainer>

                <View>
                  <ItemsContainer title="general.utils">
                    <Item
                      text="general.verifyEmail"
                      onPress={() => router.navigate('/verify-email')}
                    />

                    <Item
                      text="settings.permanentAccountCreate"
                      onPress={() => router.navigate('/upgrade-account')}
                    />

                    <Item
                      text="Send global push notification"
                      onPress={() =>
                        onHandleGlobalPushNotifications({
                          title: 'This is a global notification title',
                          body: 'This is a global notification body',
                          language,
                        })
                      }
                    />
                    <Item
                      text="Send individual push notification"
                      onPress={() =>
                        onHandleIndividualNotification({
                          title:
                            'Hinweis zu persönlichen medizinischen Bildern',
                          body: 'Wir empfehlen NICHT, persönliche medizinische Bilder zur individuellen Analyse auf EXFIT AI hochzuladen, da die Ergebnisse nicht als endgültig betrachtet werden sollten. Unsere KI-Modelle werden noch erforscht und verfeinert und es können potenzielle Ungenauigkeiten auftreten. Es eignet sich hervorragend zum Lernen und um allgemeine Einblicke zu gewinnen, für ausführlichere Überprüfungen sollten Sie jedoch einen Spezialisten konsultieren. Wenn Sie Fragen haben, kontaktieren Sie uns per E-Mail - microscanaiapp@gmail.com',
                          // title: 'Notice About Personal microscopy Images',
                          // body: 'We DO NOT encourage uploading personal microscopy images to EXFIT AI for individual analysis, as the results should not be considered final. Our AI models are still being researched and refined, and potential inaccuracies may occur. It’s great for learning and get general insights, but for in-depth reviews, consult a specialist. If you have any questions contact us via email - microscanaiapp@gmail.com',
                          userId: '',
                          language,
                        })
                      }
                    />
                    <Item
                      text="Upload terms of service"
                      onPress={() => onUploadTermsOfService({ language })}
                    />
                    <Item
                      text="Upload privacy policy"
                      onPress={() => onUploadPrivacyPolicy({ language })}
                    />
                    <Item text="Seed shop items" onPress={seedShopItems} />
                    <Item
                      text="Add completedScans field to userInfo"
                      //! be careful with the below functions
                      onPress={() =>
                        onAddFieldsToCollection({
                          fields: {
                            //add fields here
                            // completedScans: 0,
                          },
                          collectionName: 'users',
                        })
                      }
                    />
                  </ItemsContainer>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
