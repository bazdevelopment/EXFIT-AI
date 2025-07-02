/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

import { useLogin } from '@/api/user/user.hooks';
import ScreenWrapper from '@/components/screen-wrapper';
import { Checkbox, colors, ControlledInput, Text } from '@/components/ui';

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

export type LoginScreenProps = {
  onSubmit?: SubmitHandler<FormType>;
  onAnonymousSignIn?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  onBack?: () => void;
};

export default function LoginScreen({
  onSubmit = () => {},
  onSignUp,
  onBack,
}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
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

  const { mutate: onLogin, error: loginError } = useLogin();

  const handleLogin: SubmitHandler<FormType> = (data) => {
    console.log('Login data:', data, 'Keep signed in:', keepSignedIn);
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
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons
              name="chevron-back"
              size={24}
              color="#000"
              className="dark:color-white"
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Title */}
          <Text className="mb-12 mt-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Login
          </Text>
          {!!loginError && (
            <Text className="mb-5 text-center dark:text-red-400">
              {loginError.message}
            </Text>
          )}

          {/* Anonymous Sign In Button */}
          <TouchableOpacity
            onPress={handleAnonymousSignIn}
            className="mb-8 flex-row items-center justify-center rounded-lg bg-gray-100 px-6 py-4 dark:bg-gray-800"
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.white}
              className="mr-3 dark:color-gray-300"
            />
            <Text className="ml-3 font-medium text-gray-700 dark:text-gray-300">
              Continue with username
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="my-8 flex-row items-center">
            <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-gray-500 dark:text-white">
              Do you have an account?
            </Text>
            <View className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <ControlledInput
              control={control}
              name="email"
              testID="email-input"
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailField.value}
              onChangeText={emailField.onChange}
              error={errors.email?.message}
              className="h-[44] flex-1 rounded-xl border border-gray-300 bg-white p-4 pr-12 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </View>

          {/* Password Input */}
          <View className="mb-2">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-medium text-gray-700 dark:text-gray-300">
                Password
              </Text>
              <TouchableOpacity onPress={handleForgotPasswordPress}>
                <Text className="text-blue-600 dark:text-blue-400">
                  Forgot Password
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
                className="h-[44] flex-1 rounded-xl border border-gray-300 bg-white p-4 pr-12 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

          {/* Keep me signed in */}
          {/* <TouchableOpacity
            onPress={() => setKeepSignedIn(!keepSignedIn)}
            className="mb-8 mt-4 flex-row items-center"
          >
            <View
              className={`mr-3 size-5 items-center justify-center rounded border-2 ${
                keepSignedIn
                  ? 'border-teal-500 bg-teal-500 dark:border-teal-400 dark:bg-teal-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {keepSignedIn && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            <Text className="text-gray-700 dark:text-gray-300">
              Keep me signed in
            </Text>
          </TouchableOpacity> */}
          <Checkbox
            testID="checkbox"
            checked={keepSignedIn}
            onChange={() => setKeepSignedIn(!keepSignedIn)}
            accessibilityLabel="agree"
            accessibilityHint="toggle Agree"
            label="Keep me signed in"
            className="mb-6 mt-4"
          />

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSubmit(handleLogin)}
            className="mb-8 rounded-lg bg-blue-600 py-4 dark:bg-blue-500"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Login
            </Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View className="flex-row justify-center">
            {/* <Text className="text-gray-700 dark:text-gray-300">
              Don't have an Account? Use anonymous login first
            </Text> */}
            <TouchableOpacity onPress={handleSignUpPress}>
              {/* <Text className="font-medium text-blue-600 dark:text-blue-400">
                Sign up here
              </Text> */}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
