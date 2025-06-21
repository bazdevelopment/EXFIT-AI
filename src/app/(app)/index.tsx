import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import {
  useCreateActivityLog,
  useGetCalendarActivityLog,
} from '@/api/activity-logs/activity-logs.hooks';
import { useUser } from '@/api/user/user.hooks';
import ActivityPromptBanner from '@/components/banners/activity-prompt-banner';
import AICoachBanner from '@/components/banners/ai-coach-banner';
import MotivationBanner from '@/components/banners/motivation-banner';
import CalendarMiniView from '@/components/calendar-mini-view';
import DailyCheckInStatus from '@/components/daily-check-in-status';
import Greeting from '@/components/greeting';
import Icon from '@/components/icon';
import { DailyCheckInModal } from '@/components/modals/daily-check-in-modal';
import { NoActivityLogModal } from '@/components/modals/no-activity-log-modal';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, useModal } from '@/components/ui';
import { Notification } from '@/components/ui/assets/icons'; // Ensure this is installed: npx expo install expo-linear-gradient
import { useSelectedLanguage } from '@/core';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';

export default function Home() {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const activityCompleteModal = useModal();
  const activitySkippedModal = useModal();

  const currentActiveDay = getCurrentDay('YYYY-MM-DD', language);

  const {
    segmentedDays,
    currentMonth,
    currentYear,
    initialDayFocused,
    currentMonthNumber,
    startOfWeek,
    endOfWeek,
  } = useWeekNavigation();
  const {
    mutateAsync: onCreateActivityLog,
    isPending: isCreateActivityLogPending,
  } = useCreateActivityLog();

  const { data: currentWeekActivityLog } = useGetCalendarActivityLog({
    startDate: startOfWeek,
    endDate: endOfWeek,
    language,
  });

  const isDailyCheckInDone = !!currentWeekActivityLog?.[currentActiveDay];

  return (
    <ScreenWrapper>
      <View className="-mt-2 mr-4 flex-row justify-between">
        <Greeting
          userName={userInfo?.userName}
          avatarUri={require('../../components/ui/assets/images/avatar.png')}
          streaks={userInfo?.gamification?.streakBalance}
          showStreaks
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
        {isDailyCheckInDone ? (
          <DailyCheckInStatus
            status={currentWeekActivityLog?.[currentActiveDay][0]?.status}
          />
        ) : (
          <ActivityPromptBanner
            onShowActivityCompleteModal={activityCompleteModal.present}
            onShowActivitySkippedModal={activitySkippedModal.present}
          />
        )}
        {currentWeekActivityLog && (
          <CalendarMiniView
            showMonth
            showYear
            containerClassName="px-6 py-4 bg-black"
            currentWeekActivityLog={currentWeekActivityLog}
            segmentedDays={segmentedDays}
            currentMonth={currentMonth}
            currentYear={currentYear}
            initialDayFocused={initialDayFocused}
            currentMonthNumber={currentMonthNumber}
          />
        )}
        <MotivationBanner containerClassName="mt-4" />
        <AICoachBanner containerClassName="mt-4" />
        <DailyCheckInModal
          ref={activityCompleteModal.ref}
          isCreateActivityLogPending={isCreateActivityLogPending}
          onSubmit={({ durationMinutes, activityName }) =>
            onCreateActivityLog({
              language,
              date: currentActiveDay,
              type: 'daily_checkin',
              details: {
                durationMinutes,
                activityName,
              },
            }).then(() => {
              activityCompleteModal.dismiss();
            })
          }
        />
        <NoActivityLogModal
          ref={activitySkippedModal.ref}
          isCreateActivityLogPending={isCreateActivityLogPending}
          onGoToExcuseBuster={() => router.navigate('/excuse-buster')}
          onSubmit={({ skipReason }) =>
            onCreateActivityLog({
              date: currentActiveDay,
              language,
              type: 'excuse_logged',
              details: {
                excuseReason: skipReason ?? '',
              },
            }).then(() => {
              activitySkippedModal.dismiss();
            })
          }
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
