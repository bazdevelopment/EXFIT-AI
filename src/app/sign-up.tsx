/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

import { useCreatePermanentAccount } from '@/api/user/user.hooks';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { Checkbox, colors, ControlledInput, Text } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';

const schema = z
  .object({
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
    confirmPassword: z.string({
      required_error: 'Password confirmation is required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignUpFormType = z.infer<typeof schema>;

export type SignUpScreenProps = {
  onSubmit?: SubmitHandler<SignUpFormType>;
  onSignIn?: () => void;
  onBack?: () => void;
};

export default function SignUpScreen({
  onSubmit = () => {},
}: SignUpScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    mutate: createPermanentAccount,
    isPending,
    error,
  } = useCreatePermanentAccount();

  const { field: emailField } = useController({
    control,
    name: 'email',
  });

  const { field: passwordField } = useController({
    control,
    name: 'password',
  });

  const { field: confirmPasswordField } = useController({
    control,
    name: 'confirmPassword',
  });

  const handleSignUp: SubmitHandler<SignUpFormType> = (data) => {
    const { email, password } = data;
    console.log('data', data);
    if (!acceptTerms) {
      Alert.alert(
        'Terms Required',
        'Please accept the terms of use and privacy policy to continue.'
      );
      return;
    }
    console.log('SignUp data:', data, 'Accept terms:', acceptTerms);
    // onSubmit(data);
    createPermanentAccount({ email, password });
  };

  const handleSignInPress = () => {
    Alert.alert('Sign In', 'Sign in functionality would be implemented here');
    // onSignIn?.();
    router.navigate('/login');
  };

  return (
    <ScreenWrapper>
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Icon
            size={24}
            containerStyle="rounded-2xl bg-charcoal-800 p-3 w-[50]"
            onPress={router.back}
            icon={<ArrowLeft color={colors.white} />}
          />
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {/* Title */}
          <Text className="mb-12 mt-4 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign Up
          </Text>

          {!!error && (
            <Text className="mb-5 text-center dark:text-red-400">
              {error.message}
            </Text>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <ControlledInput
              control={control}
              name="email"
              returnKeyType="done"
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
          <View className="mb-4">
            <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Password
            </Text>
            <View className="relative">
              <ControlledInput
                name="password"
                control={control}
                testID="password-input"
                returnKeyType="done"
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

          {/* Confirm Password Input */}
          <View className="mb-4">
            <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </Text>
            <View className="relative">
              <ControlledInput
                name="confirmPassword"
                control={control}
                testID="confirm-password-input"
                placeholder="••••••••"
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                value={confirmPasswordField.value}
                onChangeText={confirmPasswordField.onChange}
                error={errors.confirmPassword?.message}
                className="h-[44] flex-1 rounded-xl border border-gray-300 bg-white p-4 pr-12 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                  className="dark:color-gray-300"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions Checkbox */}
          <Checkbox
            testID="terms-checkbox"
            checked={acceptTerms}
            onChange={() => setAcceptTerms(!acceptTerms)}
            accessibilityLabel="accept terms"
            accessibilityHint="toggle Accept Terms"
            label="By continuing, you agree to our Terms & Conditions and Privacy Policy"
            className="mb-6 mt-4"
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSubmit(handleSignUp)}
            className="mb-8 rounded-lg bg-blue-600 py-4 dark:bg-blue-500"
          >
            <Text className="text-center text-lg font-semibold text-white">
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Sign in link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-gray-700 dark:text-gray-300">
              Have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignInPress}>
              <Text className="font-medium text-blue-600 dark:text-blue-400">
                Sign in here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
