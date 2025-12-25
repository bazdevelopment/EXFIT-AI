/* eslint-disable max-lines-per-function */
import { LinearGradient } from 'expo-linear-gradient';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { firebaseAuth } from 'firebase/config';
import React, { useState } from 'react';
import {
  ImageBackground,
  Keyboard,
  Linking,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { useCreateAnonymousAccount } from '@/api/user/user.hooks';
import Icon from '@/components/icon';
import {
  Button,
  colors,
  FocusAwareStatusBar,
  Input,
  Text,
} from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';
import { translate, useSelectedLanguage } from '@/core';
import { useStoreUserId } from '@/core/hooks/use-store-user-id';
import getDeviceSizeCategory from '@/core/utilities/get-device-size-category';

export default function AnonymousLogin() {
  const [username, setUsername] = useState('');
  const { language } = useSelectedLanguage();
  const { isVerySmallDevice, isMediumDevice } = getDeviceSizeCategory();
  const [{ timeZone }] = getCalendars();
  const [storedUserId, setUserId] = useStoreUserId();

  const onSuccessHandler = (userId: string) => {
    //update internal storage with userId
    setUserId(userId);
  };

  const { mutateAsync: onCreateAnonymousAccount, isPending: isLoginPending } =
    useCreateAnonymousAccount(onSuccessHandler);

  const handleUpdateEmail = (text: string) => setUsername(text);

  return (
    <KeyboardAwareScrollView
      bottomOffset={300}
      contentContainerStyle={{
        flexGrow: 1, //!very important, do not change with flex:1
        overflow: 'hidden',
      }}
      keyboardShouldPersistTaps="handled"
    >
      <FocusAwareStatusBar hidden />
      <ImageBackground
        source={require('../components/ui/assets/images/chest-press.jpg')}
        resizeMode="cover"
        className="flex-1"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
          locations={[0, 0.7, 0.9]}
          style={{ flex: 1 }}
        >
          <View
            className={`h-full px-6 pt-20 ${isVerySmallDevice && 'pt-[10%]'} ${isMediumDevice && 'pt-[20%]'}`}
          >
            {/* <Branding /> */}

            <Icon
              size={24}
              iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
              onPress={router.back}
              icon={<ArrowLeft color={colors.white} />}
              color={colors.white}
            />

            <Text
              testID="form-title"
              className={`mt-14 font-semibold-poppins text-[30px] text-white ${isVerySmallDevice && 'mt-4'}`}
            >
              {translate('rootLayout.screens.namePreferenceScreen.heading')}
            </Text>

            <Text className="my-4 font-primary-poppins text-lg text-white">
              {translate(
                'rootLayout.screens.namePreferenceScreen.preferredNameQuestion'
              )}
            </Text>

            <View className="mt-10 rounded-3xl bg-blackEerie p-6">
              <Input
                testID="username"
                label={translate('components.Input.labels.nickname')}
                value={username}
                placeholder={translate(
                  'rootLayout.screens.namePreferenceScreen.placeholderPreferredName'
                )}
                style={{ fontSize: !username.length ? 12 : 14 }}
                onChangeText={handleUpdateEmail}
                autoCapitalize="sentences"
                keyboardType="default"
                autoComplete={undefined}
                autoCorrect={false}
                autoFocus
                className="dark-blackEerie h-14 flex-1 rounded-xl border-2 border-neutral-700 bg-blackEerie px-3.5 font-primary-poppins text-white dark:border-neutral-700"
                containerClassName="bg-blackEerie"
                // icon={<UserIcon top={3} />}
              />

              <View className="mt-1 w-full flex-row flex-wrap items-center">
                <Text className="text-sm text-white">
                  {translate('rootLayout.screens.login.agreeingMessage')}{' '}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      'https://exfitai-terms-conditions.netlify.app/'
                    )
                  }
                >
                  <Text className="text-sm text-blue-400 dark:text-blue-400">
                    {translate('rootLayout.screens.login.termsAndConditions')}{' '}
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-white">
                  {' '}
                  {translate('general.and')}{' '}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://exfitai-privacy.netlify.app/')
                  }
                >
                  <Text className="text-sm text-blue-400 dark:text-blue-400">
                    {translate('rootLayout.screens.login.privacyPolicy')}{' '}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="mt-6">
                <Button
                  label={translate('general.continue')}
                  // withGradientBackground
                  // variant="default"
                  className="h-14 w-full rounded-full bg-[#4E52FB] dark:bg-[#4E52FB]"
                  textClassName="text-base font-medium-poppins text-center text-white dark:text-white"
                  iconPosition="left"
                  onPress={async () => {
                    await onCreateAnonymousAccount({
                      timezone: timeZone,
                      username,
                      language,
                      // submit the stored user id, otherwise check for firebase uid
                      //do not rely only on firebaseAuth.currentUser?.uid,because if the user logs out it will become undefined, but the storedUserId will still be populated
                      actualUserId: (storedUserId ||
                        firebaseAuth.currentUser?.uid) as string,
                    });
                    Keyboard.dismiss();
                  }}
                  disabled={!username}
                  loading={isLoginPending}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
}
