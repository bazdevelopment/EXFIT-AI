import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, View } from 'react-native';

import { useCreatePermanentAccount } from '@/api/user/user.hooks';
import GradientText from '@/components/gradient-text';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, Input, Text } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';
import { translate } from '@/core';

// --- The React Native Component ---
const UpgradeAccountScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    mutate: createPermanentAccount,
    isPending,
    error,
  } = useCreatePermanentAccount();

  const handleUpgrade = () => {
    // Basic client-side validation
    if (!email || !password) {
      Alert.alert(
        translate('general.error'),
        translate('rootLayout.screens.upgradeAccount.emailPasswordRequired')
      );
      return;
    }
    createPermanentAccount({ email, password });
  };

  return (
    <ScreenWrapper>
      <View>
        <View className="mb-8 ml-4 mt-4 flex-row items-center">
          <Icon
            icon={<ArrowLeft />}
            iconContainerStyle="items-center p-3 justify-center rounded-2xl bg-gray-800"
            size={24}
            color={colors.white}
            onPress={router.back}
          />

          <GradientText colors={['#3195FD', '#666AFF']} className="ml-4">
            <Text className="text-center text-2xl font-bold text-blue-400">
              {translate('rootLayout.screens.excuseBuster.heading')}
            </Text>
          </GradientText>
        </View>

        <View className="justify-center p-5">
          <Text className="mb-2.5 text-center text-2xl font-bold">
            {translate('rootLayout.screens.upgradeAccount.secureProgress')}
          </Text>
          <Text className="mb-7.5 text-center text-base text-gray-500">
            {translate('rootLayout.screens.upgradeAccount.permanentAccount')}
          </Text>

          <Input
            className="px-6 pb-4 pt-3 text-base text-white"
            placeholder={translate('rootLayout.screens.login.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            className="px-6 pb-4 pt-3 text-base text-white"
            placeholder={translate('rootLayout.screens.login.createPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isPending ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Create Account & Save" onPress={handleUpgrade} />
          )}

          {error && (
            <Text className="mt-3.5 text-center text-red-500">
              {error.message}
            </Text>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default UpgradeAccountScreen;
