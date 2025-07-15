import { router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useUser } from '@/api/user/user.hooks';
import Avatar from '@/components/avatar';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, Text } from '@/components/ui';
import {
  ArrowLeft,
  ArrowRight,
  PermanentAccount,
} from '@/components/ui/assets/icons';
import { useSelectedLanguage } from '@/core';

import dayjs from '../lib/dayjs';

const ProfileScreen = () => {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="flex-row items-center justify-start px-4 py-3">
        <Icon
          size={24}
          containerStyle="rounded-2xl bg-charcoal-800 p-3 w-[50]"
          onPress={router.back}
          icon={<ArrowLeft color={colors.white} />}
        />
        <Text className="ml-4 font-semibold-poppins text-xl text-white dark:text-white">
          Profile
        </Text>
      </View>

      {/* Profile Section */}
      <View className="items-center px-6 py-8">
        {/* Avatar */}
        <Avatar
          imageUri={
            userInfo.onboarding.gender === 'male'
              ? require('../components/ui/assets/images/avatar-male.png')
              : require('../components/ui/assets/images/avatar-female.png')
          }
          name={userInfo.userName}
          size="large"
          showEditBadge={false}
          showVerifiedBadge={!userInfo.isAnonymous}
          editable={false}
          creationDate={dayjs(userInfo.createdAt).format('MMMM YYYY')}
        />
      </View>

      {/* Account Section */}
      <View className="flex-1 px-6">
        <Text className="mb-4 font-semibold-poppins text-xl text-white dark:text-white">
          Account
        </Text>

        {/* Convert to permanent account option */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center rounded-xl border  bg-gray-800 p-4 shadow-sm  dark:bg-gray-800 dark:shadow-none"
          onPress={() => router.navigate('/sign-up')}
        >
          <Icon
            size={24}
            containerStyle="rounded-full bg-charcoal-800 p-3 mr-4"
            onPress={() => router.navigate('/sign-up')}
            icon={<PermanentAccount color={colors.white} />}
          />

          <View className="flex-1">
            <Text className="mb-1 font-semibold-poppins text-base text-white dark:text-white">
              Convert to permanent account
            </Text>
            <Text className="text-sm leading-5 text-gray-500 dark:text-gray-400">
              Ensure data safety and keep your progress saved
            </Text>
          </View>

          <ArrowRight
            size={20}
            color="#9CA3AF"
            className="ml-5 dark:text-gray-400"
          />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileScreen;
