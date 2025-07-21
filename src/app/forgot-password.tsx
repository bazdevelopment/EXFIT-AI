/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

import { useResetPassword } from '@/api/user/user.hooks';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, ControlledInput, Text } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';

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
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const { field: emailField } = useController({
    control,
    name: 'email',
  });

  const { mutate: onResetPassword, isSuccess, error } = useResetPassword();

  const handleForgotPassword: SubmitHandler<ForgotPasswordFormType> = (
    data
  ) => {
    console.log('Forgot password data:', data);
    Alert.alert(
      'Password Reset Sent',
      'If an account with this email exists, we have sent you a password reset link.',
      [
        {
          text: 'OK',
          onPress: () => onResetPassword(data),
        },
      ]
    );
    // onResetPassword(data);
  };

  const handleLoginPress = () => {
    // Alert.alert('Login', 'Login functionality would be implemented here');
    // onLogin?.();
    router.navigate('/login');
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
            Forgot Password
          </Text>

          {/* Description */}
          {isSuccess ? (
            <Text className="dark:white mb-12 text-base leading-6 text-white">
              Please check your email for a password reset link. If you don't
              see it in your inbox, be sure to check your spam or junk folder.
            </Text>
          ) : (
            <Text className="mb-12 text-base leading-6 text-white dark:text-white">
              Enter the email address registered with your account. We'll send
              you a link to reset your password.
            </Text>
          )}

          {/* Email Input */}
          <View className="mb-8">
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
              className="h-[44] flex-1 rounded-xl border border-gray-600 bg-gray-800 p-4 pr-12 text-white dark:border-gray-600 dark:bg-gray-800  dark:text-white"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(handleForgotPassword)}
            className="mb-8 rounded-full bg-[#4E52FB] py-3 dark:bg-[#4E52FB]"
          >
            <Text className="text-center font-medium-poppins text-base text-white">
              Submit
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center">
            <Text className="text-white dark:text-white">
              Remembered password?{' '}
            </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="font-medium-poppins text-blue-400 dark:text-blue-400">
                Login to your account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
