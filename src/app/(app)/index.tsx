import React from 'react';
import { ScrollView, View } from 'react-native';

import ActivityPromptBanner from '@/components/banners/activity-prompt-banner';
import AICoachBanner from '@/components/banners/ai-coach-banner';
import MotivationBanner from '@/components/banners/motivation-banner';
import CalendarMiniView from '@/components/calendar-mini-view';
import Greeting from '@/components/greeting';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors } from '@/components/ui';
import { Notification } from '@/components/ui/assets/icons'; // Ensure this is installed: npx expo install expo-linear-gradient

export default function Home() {
  return (
    <ScreenWrapper>
      <View className="-mt-2 mr-4 flex-row  justify-between">
        <Greeting
          userName="Marian"
          avatarUri={require('../../components/ui/assets/images/avatar.png')}
        />
        <Icon
          icon={<Notification color="red" />}
          size={20}
          color={colors.charcoal[800]}
          iconContainerStyle="p-4 bg-charcoal-800 rounded-full mt-2"
          showBadge
          badgeSize={7}
          badgeColor="red"
          badgeClassName="right-1.5 top-1"
        />
      </View>
      <ScrollView contentContainerClassName="pb-16">
        <ActivityPromptBanner containerClassName="mt-1" />
        <CalendarMiniView
          showMonth
          showYear
          containerClassName="px-6 py-4 bg-black"
        />
        <MotivationBanner containerClassName="mt-4" />
        <AICoachBanner containerClassName="mt-4" />
      </ScrollView>
    </ScreenWrapper>
  );
}
