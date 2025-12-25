/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

import { useResetPassword, useUser } from '@/api/user/user.hooks';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { Button, colors, ControlledInput, Text } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';
import { translate, useSelectedLanguage } from '@/core';

const schema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
});

export type ForgotPasswordFormType = z.infer<typeof schema>;

export type ForgotPasswordScreenProps = {
  onSubmit?: SubmitHandler<ForgotPasswordFormType>;
  onLogin?: () => void;
  onBack?: () => void;
};

export default function ForgotPasswordScreen({
  onSubmit = () => {},
  onLogin,
  onBack,
}: ForgotPasswordScreenProps) {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: userInfo?.email || '',
    },
  });

  const { field: emailField } = useController({
    control,
    name: 'email',
  });

  const {
    mutate: onResetPassword,
    isSuccess,
    error: resetPasswordError,
    isPending: isPendingResetPassword,
  } = useResetPassword();

  const handleForgotPassword: SubmitHandler<ForgotPasswordFormType> = (
    data
  ) => {
    Alert.alert(
      translate('rootLayout.screens.forgotPassword.alertTitle'),
      translate('rootLayout.screens.forgotPassword.alertSubtitle'),
      [
        {
          text: translate('general.ok'),
          onPress: () => onResetPassword(data),
        },
      ]
    );
  };

  const handleLoginPress = () => {
    router.push({
      pathname: `/login`,
      params: {
        showAnonymousLoginOption: 'false',
        showSignUpLabel: 'false',
        showBackButton: 'true',
      },
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Icon
            size={24}
            iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
            onPress={router.back}
            icon={<ArrowLeft color={colors.white} />}
            color={colors.white}
          />
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Title */}
          <Text className="mb-6 mt-4 font-medium-poppins text-3xl text-white dark:text-white">
            {translate('rootLayout.screens.forgotPassword.heading')}
          </Text>
          {!!resetPasswordError && (
            <Text className="mb-5 text-center dark:text-red-400">
              {resetPasswordError.message}
            </Text>
          )}

          {/* Description */}
          {isSuccess ? (
            <Text className="mb-12 font-medium-poppins text-base leading-6 text-success-400 dark:text-success-400">
              {translate('rootLayout.screens.forgotPassword.verificationSent')}
            </Text>
          ) : (
            <Text className="mb-12 text-base leading-6 text-white dark:text-white">
              {translate(
                'rootLayout.screens.forgotPassword.verificationHeading'
              )}
            </Text>
          )}

          {/* Email Input */}
          <View className="mb-8">
            <ControlledInput
              control={control}
              name="email"
              testID="email-input"
              label={translate('rootLayout.screens.login.emailAddress')}
              placeholder={translate(
                'rootLayout.screens.login.emailPlaceholder'
              )}
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailField.value}
              onChangeText={emailField.onChange}
              error={errors.email?.message}
              className="h-[44] flex-1 rounded-xl border border-gray-600 bg-gray-800 p-4 pr-12 text-white dark:border-gray-600 dark:bg-gray-800  dark:text-white"
            />
          </View>

          {/* Submit Button */}
          <Button
            label={translate('general.submit')}
            className="h-14 w-full rounded-full bg-[#4E52FB] dark:bg-[#4E52FB]"
            textClassName="text-base font-medium-poppins text-center text-white dark:text-white"
            iconPosition="left"
            onPress={handleSubmit(handleForgotPassword)}
            loading={isPendingResetPassword}
          />

          {/* Login link */}
          <View className="flex-row justify-center">
            <Text className="text-white dark:text-white">
              {translate('rootLayout.screens.forgotPassword.rememberPassword')}{' '}
            </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="font-medium-poppins text-blue-400 dark:text-blue-400">
                {translate('rootLayout.screens.forgotPassword.loginAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
