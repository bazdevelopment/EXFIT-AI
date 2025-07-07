import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

import {
  useCreateActivityLog,
  useGetCalendarActivityLog,
} from '@/api/activity-logs/activity-logs.hooks';
import {
  useGetAiTasks,
  useUpdateAiTaskStatus,
} from '@/api/ai-tasks/ai-tasks.hooks';
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
import TaskListOverview from '@/components/task-list-overview';
import { colors, useModal } from '@/components/ui';
import { Notification } from '@/components/ui/assets/icons'; // Ensure this is installed: npx expo install expo-linear-gradient
import { useSelectedLanguage } from '@/core';
import { useDelayedRefetch } from '@/core/hooks/use-delayed-refetch';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';

import dayjs from '../../lib/dayjs';

// eslint-disable-next-line max-lines-per-function
export default function Home() {
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const activityCompleteModal = useModal();
  const activitySkippedModal = useModal();
  const [{ timeZone }] = getCalendars();

  const currentActiveDay = getCurrentDay('YYYY-MM-DD', language);
  const lastResetStreakDay =
    userInfo?.gamification.streakResetDates?.[
      userInfo?.gamification?.streakResetDates?.length - 1
    ];
  const lastResetStreakDate = dayjs(lastResetStreakDay).format('YYYY-MM-DD');

  const {
    segmentedDays,
    currentMonth,
    currentYear,
    initialDayFocused,
    currentMonthNumber,
    startOfWeek,
    endOfWeek,
    weekOffset,
  } = useWeekNavigation();
  const {
    mutateAsync: onCreateActivityLog,
    isPending: isCreateActivityLogPending,
  } = useCreateActivityLog();

  const { data: currentWeekActivityLog, refetch: refetchActivityLog } =
    useGetCalendarActivityLog({
      startDate: startOfWeek,
      endDate: endOfWeek,
      language,
    });
  const { data: todayActiveTasks } = useGetAiTasks(currentActiveDay);

  const { mutate: onUpdateAiTaskStatus } =
    useUpdateAiTaskStatus(currentActiveDay);

  const isDailyCheckInDone = !!currentWeekActivityLog?.[currentActiveDay];

  const { isRefetching, onRefetch } = useDelayedRefetch(refetchActivityLog);

  return (
    <ScreenWrapper>
      <View className="-mt-2 mr-4 flex-row justify-between">
        <Greeting
          userName={userInfo?.userName}
          avatarUri={require('../../components/ui/assets/images/avatar.png')}
          gemsBalance={userInfo?.gamification?.gemsBalance}
          xpBalance={userInfo?.gamification.xpTotal}
          streakBalance={userInfo?.gamification.currentStreak}
          showStreaks
        />
        <Icon
          icon={<Notification color="red" />}
          size={24}
          color={colors.charcoal[800]}
          iconContainerStyle="p-3 bg-charcoal-800 rounded-full mt-2"
          showBadge
          badgeSize={7}
          badgeColor="red"
          badgeClassName="right-1.5 top-1"
        />
      </View>
      <ScrollView
        contentContainerClassName="pb-16"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefetch}
            tintColor={colors.white}
            colors={[colors.black]}
          />
        }
      >
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

        {!!todayActiveTasks?.length && (
          <TaskListOverview
            tasks={todayActiveTasks}
            onCompleteTask={(taskId) =>
              onUpdateAiTaskStatus({ language, status: 'completed', taskId })
            }
            onSkipTask={(taskId) =>
              onUpdateAiTaskStatus({ language, status: 'skipped', taskId })
            }
            additionalClassName="mt-4"
          />
        )}

        {currentWeekActivityLog && (
          <CalendarMiniView
            showMonth
            showYear
            showStreak
            currentStreak={userInfo?.gamification?.currentStreak}
            containerClassName="px-6 py-4 mt-2 bg-[#141426]"
            currentWeekActivityLog={currentWeekActivityLog}
            segmentedDays={segmentedDays}
            currentMonth={currentMonth}
            currentYear={currentYear}
            initialDayFocused={initialDayFocused}
            currentMonthNumber={currentMonthNumber}
            weekOffset={weekOffset}
            lastResetStreakDate={lastResetStreakDate}
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
              timezone: timeZone as string,
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
              timezone: timeZone as string,
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
