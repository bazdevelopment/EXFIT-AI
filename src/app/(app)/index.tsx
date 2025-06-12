import React from 'react';
import { ScrollView } from 'react-native';

import ActivityPromptBanner from '@/components/banners/activity-prompt-banner';
import AICoachBanner from '@/components/banners/ai-coach-banner';
import MotivationBanner from '@/components/banners/motivation-banner';
import CalendarMiniView from '@/components/calendar-mini-view';
import Greeting from '@/components/greeting';
import Icon from '@/components/icon';
import {
  colors,
  FocusAwareStatusBar,
  SafeAreaView,
  View,
} from '@/components/ui';
import { Notification } from '@/components/ui/assets/icons'; // Ensure this is installed: npx expo install expo-linear-gradient

export default function Home() {
  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <FocusAwareStatusBar />
        <View className="mr-4 flex-row items-center justify-between">
          <Greeting
            userName="Marian"
            avatarUri={require('../../components/ui/assets/images/avatar.png')}
          />
          <Icon
            icon={<Notification color="red" />}
            size={20}
            color={colors.charcoal[800]}
            iconContainerStyle="p-4 bg-charcoal-800 rounded-full"
            showBadge
            badgeSize={7}
            badgeColor="red"
            badgeClassName="right-1.5 top-1"
          />
        </View>
        <ScrollView>
          <ActivityPromptBanner containerClassName="mt-1" />
          <CalendarMiniView />
          <MotivationBanner containerClassName="mt-4" />
          <AICoachBanner containerClassName="mt-4" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
