import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GAMIFICATION_REWARDS_CONFIG } from 'functions/utilities/rewards-pricing';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { useUser } from '@/api/user/user.hooks';
import Avatar from '@/components/avatar';
import ProgressBarLevel from '@/components/progress-bar-level';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import StatsGrid from '@/components/stats-grid';
import { Button, Text } from '@/components/ui';
import { WarningIconRounded } from '@/components/ui/assets/icons';
import { UpgradeProgress } from '@/components/ui/assets/icons/upgrade-progress';
import { useSelectedLanguage } from '@/core';
import { calculateFreeTrialDays } from '@/core/utilities/calculate-free-trial-days';
import { calculateLevel } from '@/core/utilities/calculate-level';

// Types

interface Badge {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
}

interface InventoryItem {
  id: string;
  title: string;
  icon: string;
  owned: number;
}

const ProfileHeader: React.FC<{
  isTemporary: boolean;
  trialDaysLeft: number;
  onCreateAccount: () => void;
  onSettings: () => void;
  userInfo;
}> = ({
  isTemporary,
  trialDaysLeft,
  onCreateAccount,
  onSettings,
  userInfo,
}) => (
  <View className="items-center">
    <View className="relative">
      <Avatar
        imageUri={
          userInfo.onboarding.gender === 'male'
            ? require('../components/ui/assets/images/avatar-male.png')
            : require('../components/ui/assets/images/avatar-female.png')
        }
        name={userInfo.userName}
        size="medium"
        showEditBadge={false}
        showVerifiedBadge={!userInfo.isAnonymous}
        editable={false}
        creationDate={dayjs(userInfo.createdAt).format('MMMM YYYY')}
      />
    </View>

    <View className="mt-4 flex-row items-center gap-2">
      <View className="w-[45%] rounded-full border border-[#4E52FB] bg-transparent p-2.5">
        <Text className="text-center text-sm text-white ">
          {isTemporary ? 'Temporary account' : 'Permanent Account'}
        </Text>
      </View>
      <LinearGradient
        colors={['#FC9003', '#FF530C']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ borderRadius: 100, width: '45%' }}
      >
        <View className="flex-row items-center justify-center gap-2 rounded-full px-4 py-2">
          <WarningIconRounded width={24} height={24} />
          <Text className="font-semibold-poppins text-sm text-white">
            Free Trial: {trialDaysLeft} days left
          </Text>
        </View>
      </LinearGradient>
    </View>

    {/* Banner with triangle pointer */}
    <View className="relative mt-4 w-[90%]">
      {/* Triangle pointing upward to temporary account */}
      {isTemporary && (
        <View
          className="absolute -top-3 left-20 z-10"
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderBottomWidth: 10,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: '#4E52FB',
          }}
        />
      )}

      <LinearGradient
        colors={['#4E52FB', '#2326EA']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ borderRadius: 20 }}
      >
        <View className="rounded-2xl p-4 pb-3">
          <Text className="text-md mb-2 font-semibold-poppins text-white">
            Secure and sync your progress with a permanent account.
          </Text>
          <Text className="font-medium-poppins text-sm text-white">
            {`Earn ⚡ ${GAMIFICATION_REWARDS_CONFIG.eventRewards.permanent_account_creation.xp} XP & 💎 ${GAMIFICATION_REWARDS_CONFIG.eventRewards.permanent_account_creation.gems} gems!`}
          </Text>
          <Button
            label="Create My Account"
            className="mt-3 h-[34px] rounded-full bg-white active:opacity-90"
            textClassName="text-black font-medium-poppins"
            onPress={onCreateAccount}
          />
        </View>
      </LinearGradient>
    </View>
  </View>
);
const _SectionHeader: React.FC<{
  title: string;
  onViewAll?: () => void;
}> = ({ title, onViewAll }) => (
  <View className="mx-4 mb-4 flex-row items-center justify-between">
    <Text className="font-semibold-poppins text-xl text-white">{title}</Text>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll}>
        <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
      </TouchableOpacity>
    )}
  </View>
);

const UpgradeCard: React.FC<{
  onUpgrade: () => void;
}> = ({ onUpgrade }) => (
  <View className="mx-4 mb-6">
    <View className="relative overflow-hidden rounded-2xl bg-green-500 p-4 pb-2">
      <View className="flex-row items-center">
        <UpgradeProgress width={70} height={70} />
        <View className="ml-3 flex-1">
          <Text className="mb-1 font-bold-poppins text-lg text-white">
            Upgrade to EXFIT AI PRO
          </Text>
          <Text className="font-medium-poppins text-sm text-green-100">
            All AI features. All premium tools. All yours to stay on track.
          </Text>
        </View>
      </View>

      <Button
        label="Upgrade"
        className="mt-3 h-[34px] rounded-full bg-white active:opacity-90"
        textClassName="text-black font-medium-poppins"
        onPress={onUpgrade}
      />
    </View>
  </View>
);

// Main Component
const ProfileScreen: React.FC = () => {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

  const daysLeft = calculateFreeTrialDays({
    endDateISO: userInfo.trial.endDateISO,
  });

  const _badges = [
    { id: '1', title: 'Habit Hero', icon: '🤠', earned: true },
    { id: '2', title: 'Consistency Champ', icon: '💝', earned: true },
    { id: '3', title: 'Master of Motion', icon: '👟', earned: true },
  ];

  const _inventory = [
    { id: '1', title: 'Streak Freeze Potion', icon: '🧪', owned: 2 },
    { id: '2', title: 'Time Turner', icon: '⏳', owned: 1 },
  ];

  const levelInfo = calculateLevel(userInfo.gamification.xpTotal);

  const handleCreateAccount = () => {
    router.navigate('/sign-up');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
    // Navigate to settings
  };

  const _handleBadgePress = (badge: Badge) => {
    console.log('Badge pressed:', badge.title);
    // Show badge details
  };

  const _handleInventoryPress = (item: InventoryItem) => {
    console.log('Inventory item pressed:', item.title);
    // Show item details or use item
  };

  const handleUpgrade = () => {
    router.push({
      pathname: '/paywall',
      params: { showFreeTrialOffering: 'false', allowToNavigateBack: 'true' },
    });
  };

  const _handleViewAllBadges = () => {
    console.log('View all badges');
    // Navigate to badges screen
  };

  const _handleViewAllInventory = () => {
    console.log('View all inventory');
    // Navigate to inventory screen
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Profile" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          isTemporary={true} // here we need a variable to check if the user created a permanent account or not
          trialDaysLeft={daysLeft}
          onCreateAccount={handleCreateAccount}
          onSettings={handleSettings}
          userInfo={userInfo}
        />

        <StatsGrid
          stats={{
            streak: userInfo.gamification.streakBalance || 0,
            gems: userInfo.gamification.gemsBalance,
            xp: userInfo.gamification.xpTotal,
            level: levelInfo.currentLevel,
          }}
        />

        <ProgressBarLevel levelInfo={levelInfo} />

        {/* <SectionHeader title="Badges" onViewAll={handleViewAllBadges} /> */}
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onPress={() => handleBadgePress(badge)}
            />
          ))}
        </ScrollView>

        <SectionHeader title="Inventory" onViewAll={handleViewAllInventory} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {inventory.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onPress={() => handleInventoryPress(item)}
            />
          ))}
        </ScrollView> */}

        <UpgradeCard onUpgrade={handleUpgrade} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default ProfileScreen;
