/* eslint-disable max-lines-per-function */
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { ImageBackground, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { useCreateAnonymousAccount } from '@/api/user/user.hooks';
import { Button, FocusAwareStatusBar, Input, Text } from '@/components/ui';
import { UserIcon } from '@/components/ui/assets/icons';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import { useStoreUserId } from '@/core/hooks/use-store-user-id';
import getDeviceSizeCategory from '@/core/utilities/get-device-size-category';

export default function AnonymousLogin() {
  const [username, setUsername] = useState('');
  const { language } = useSelectedLanguage();
  const { isVerySmallDevice, isMediumDevice } = getDeviceSizeCategory();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [storedUserId, setUserId] = useStoreUserId();

  const onSuccessHandler = (userId: string) => {
    //update internal storage with userId
    setUserId(userId);
  };

  const { mutate: onCreateAnonymousAccount, isPending: isLoginPending } =
    useCreateAnonymousAccount(onSuccessHandler);

  const handleUpdateEmail = (text: string) => setUsername(text);

  return (
    <View className="flex-1">
      <FocusAwareStatusBar hidden />
      <KeyboardStickyView
        className="flex-1 bg-black"
        offset={{
          opened: isVerySmallDevice
            ? 0
            : isMediumDevice
              ? DEVICE_TYPE.IOS
                ? 250
                : 200
              : 270,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            overflow: 'hidden',
            flex: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground
            source={require('../components/ui/assets/images/chest-press.jpg')}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,1)', 'rgba(0,0,0,1)']}
              locations={[0, 0.9]}
            >
              <View
                className={`h-full px-6 pt-20 ${isVerySmallDevice && 'pt-[10%]'} ${isMediumDevice && 'pt-[20%]'}`}
              >
                {/* <Branding /> */}

                <Text
                  testID="form-title"
                  className={`mt-14 font-bold-nunito text-[32px] text-white ${isVerySmallDevice && 'mt-4'}`}
                >
                  {translate('rootLayout.screens.namePreferenceScreen.heading')}
                </Text>

                <Text className="my-4 text-xl text-white">
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
                    // autoFocus
                    className="h-16 flex-1 rounded-3xl bg-blackEerie px-3.5 py-5 font-primary-nunito text-white dark:border-neutral-700 dark:bg-charcoal-800"
                    containerClassName="bg-blackEerie"
                    icon={<UserIcon top={3} />}
                  />

                  <View className="mt-1 w-full flex-row flex-wrap items-center">
                    <Text className="text-sm text-white">
                      {translate('rootLayout.screens.login.agreeingMessage')}{' '}
                    </Text>
                    <Link
                      href="/terms-of-service"
                      className="text-sm text-primary-900"
                    >
                      {translate('rootLayout.screens.login.termsAndConditions')}
                    </Link>
                    <Text className="text-sm text-white">
                      {' '}
                      {translate('general.and')}{' '}
                    </Text>
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-primary-900"
                    >
                      {translate('rootLayout.screens.login.privacyPolicy')}
                    </Link>
                  </View>
                  <View className="mt-6">
                    <Button
                      label={translate('general.continue')}
                      withGradientBackground
                      variant="default"
                      className="w-full"
                      textClassName="text-lg text-center text-white dark:text-white"
                      iconPosition="left"
                      onPress={() => {
                        router.navigate('/onboarding-second');
                        // onCreateAnonymousAccount({
                        //   username,
                        //   language,
                        //   // submit the stored user id, otherwise check for firebase uid
                        //   //do not rely only on firebaseAuth.currentUser?.uid,because if the user logs out it will become undefined, but the storedUserId will still be populated
                        //   actualUserId:
                        //     storedUserId || firebaseAuth.currentUser?.uid,
                        // });
                        // Keyboard.dismiss();
                      }}
                      disabled={!username}
                      loading={isLoginPending}
                    />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </ScrollView>
      </KeyboardStickyView>
    </View>
  );
}
