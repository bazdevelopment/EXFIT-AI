/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

import { useLogin, useUser } from '@/api/user/user.hooks';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import {
  Button,
  Checkbox,
  colors,
  ControlledInput,
  Text,
} from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';
import { translate, useSelectedLanguage } from '@/core';

const schema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const {
    showAnonymousLoginOption = 'true',
    showSignUpLabel = 'false',
    showBackButton = 'false',
  } = useLocalSearchParams();

  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: userInfo?.email || '',
      password: '',
    },
  });

  const { field: emailField } = useController({
    control,
    name: 'email',
  });

  const { field: passwordField } = useController({
    control,
    name: 'password',
  });

  const {
    mutate: onLogin,
    isPending: isPendingLogin,
    error: loginError,
  } = useLogin();

  const handleLogin: SubmitHandler<FormType> = (data) => {
    onLogin(data);
  };

  const handleAnonymousSignIn = () => {
    // onAnonymousSignIn?.();
    router.navigate('/anonymous-login');
  };

  const handleForgotPasswordPress = () => {
    // onForgotPassword?.();
    router.navigate('/forgot-password');
  };

  const handleSignUpPress = () => {
    Alert.alert('Sign Up', 'Sign up functionality would be implemented here');
    onSignUp?.();
  };

  const handleBackPress = () => {
    onBack?.();
  };

  return (
    <ScreenWrapper>
      <ScrollView>
        {/* Header */}
        {showBackButton === 'true' && (
          <View className="flex-row items-center px-4 py-3">
            <Icon
              size={24}
              iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
              onPress={router.back}
              icon={<ArrowLeft color={colors.white} />}
              color={colors.white}
            />
          </View>
        )}

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Title */}
          <Text className="mb-12 mt-10 text-center font-semibold-poppins text-3xl text-white dark:text-white">
            {translate('rootLayout.screens.login.heading')}
          </Text>
          {!!loginError && (
            <Text className="mb-5 text-center dark:text-red-400">
              {loginError.message}
            </Text>
          )}

          {/* Anonymous Sign In Button */}
          {showAnonymousLoginOption === 'true' && (
            <TouchableOpacity
              onPress={handleAnonymousSignIn}
              className="mb-8 flex-row items-center justify-center rounded-lg bg-gray-800 px-6 py-4 dark:bg-gray-800"
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.white}
                className="mr-3 dark:color-gray-300"
              />
              <Text className="ml-3 font-medium-poppins text-white dark:text-white">
                {translate('rootLayout.screens.login.continueName')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View className="my-8 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 font-primary-poppins text-white dark:text-white">
              {translate('rootLayout.screens.login.existingAccount')}
            </Text>
            <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Email Input */}
          <View className="mb-4">
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
              className="h-[44] flex-1 rounded-xl border border-gray-600 bg-gray-800 p-4 pr-12 text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-medium-poppins text-white dark:text-white">
                {translate('rootLayout.screens.login.password')}
              </Text>
              <TouchableOpacity onPress={handleForgotPasswordPress}>
                <Text className="font-medium-poppins text-blue-400 dark:text-blue-400">
                  {translate('rootLayout.screens.login.password')}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="relative">
              <ControlledInput
                name="password"
                control={control}
                testID="password-input"
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={passwordField.value}
                onChangeText={passwordField.onChange}
                error={errors.password?.message}
                className="h-[44] flex-1 rounded-xl border border-gray-600 bg-gray-800 p-4 pr-12 text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                  className="dark:color-gray-300"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Checkbox
            testID="checkbox"
            checked={keepSignedIn}
            onChange={() => setKeepSignedIn(!keepSignedIn)}
            accessibilityLabel="agree"
            accessibilityHint="toggle Agree"
            label={translate('rootLayout.screens.login.keepSigned')}
            className="mb-6 mt-4"
          />

          {/* Login Button */}
          <Button
            label={translate('rootLayout.screens.login.heading')}
            className="h-14 w-full rounded-full bg-[#4E52FB] dark:bg-[#4E52FB]"
            textClassName="text-base font-medium-poppins text-center text-white dark:text-white"
            iconPosition="left"
            onPress={handleSubmit(handleLogin)}
            loading={isPendingLogin}
          />

          {/* {showSignUpLabel === 'true' && (
            <View className="flex-row items-center justify-center">
              <Text className="text-white dark:text-gray-300">
                Need an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => {}}>
                <Text className="font-medium-poppins text-blue-400 dark:text-blue-400">
                  Sign up here
                </Text>
              </TouchableOpacity>
            </View>
          )} */}

          {/* Sign up link */}
          {/* <View className="flex-row justify-center"> */}
          {/* <Text className="text-gray-700 dark:text-gray-300">
              Don't have an Account? Use anonymous login first
            </Text> */}
          {/* <TouchableOpacity onPress={handleSignUpPress}> */}
          {/* <Text className="font-medium text-blue-600 dark:text-blue-400">
                Sign up here
              </Text> */}
          {/* </TouchableOpacity> */}
          {/* </View> */}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
