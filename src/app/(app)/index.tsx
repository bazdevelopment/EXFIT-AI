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
import { DailyActivityModal } from '@/components/modals/daily-activity-modal';
import { DailyCheckInModal } from '@/components/modals/daily-check-in-modal';
import { NoActivityLogModal } from '@/components/modals/no-activity-log-modal';
import RewardsOverview from '@/components/rewards-overview';
import ScreenWrapper from '@/components/screen-wrapper';
import TaskListOverview from '@/components/task-list-overview';
import { colors, Image, useModal } from '@/components/ui';
import { BellIcon } from '@/components/ui/assets/icons';
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
  const dailyActivityModal = useModal();

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
      <View className="flex-row justify-between">
        <View className="-mt-2 flex-row items-center">
          <Image
            source={require('../../components/ui/assets/images/avatar.png')}
            className="top-1 mx-4 size-10 rounded-full" // Tailwind classes for styling the avatar
            accessibilityLabel="User Avatar"
            onError={() => console.error('Failed to load avatar image:')}
          />

          <RewardsOverview
            userName={userInfo?.userName}
            gemsBalance={userInfo?.gamification?.gemsBalance}
            xpBalance={userInfo?.gamification.xpTotal}
            streakBalance={userInfo?.gamification.currentStreak}
            showStreaks={false}
          />
        </View>

        <Icon
          icon={<BellIcon color="red" />}
          size={24}
          color={colors.charcoal[800]}
          iconContainerStyle="p-2.5 border-[1px] border-charcoal-600 rounded-full "
          showBadge
          badgeSize={7}
          badgeColor="red"
          badgeClassName="right-1.5"
          containerStyle="right-4"
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
        <Greeting
          showGreeting
          userName={userInfo.userName}
          additionalClassName="ml-6 my-3"
        />

        <View className="mx-1 rounded-2xl bg-[#191A21] pb-2">
          {currentWeekActivityLog && (
            <CalendarMiniView
              showMonth
              showYear
              showStreak
              currentStreak={userInfo?.gamification?.currentStreak}
              containerClassName="mx-2 mt-2 p-1"
              currentWeekActivityLog={currentWeekActivityLog}
              segmentedDays={segmentedDays}
              currentMonth={currentMonth}
              currentYear={currentYear}
              initialDayFocused={initialDayFocused}
              currentMonthNumber={currentMonthNumber}
              weekOffset={weekOffset}
              lastResetStreakDate={lastResetStreakDate}
              onDayPress={(data) => dailyActivityModal.present(data)}
            />
          )}
          {!isDailyCheckInDone ? (
            <ActivityPromptBanner
              containerClassName="mt-2"
              onShowActivityCompleteModal={() =>
                activityCompleteModal.present({
                  type: 'daily_checkin',
                })
              }
              onShowActivitySkippedModal={activitySkippedModal.present}
            />
          ) : (
            <DailyCheckInStatus
              additionalClassname="mt-2"
              status={currentWeekActivityLog?.[currentActiveDay][0]?.status}
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
              additionalClassName="bg-black mt-2 mx-2 py-4 rounded-xl"
            />
          )}
        </View>

        <View className="mx-2">
          <MotivationBanner containerClassName="mt-4" />
          <AICoachBanner containerClassName="mt-4" />
        </View>

        <DailyCheckInModal
          ref={activityCompleteModal.ref}
          isCreateActivityLogPending={isCreateActivityLogPending}
          onSubmit={({ durationMinutes, activityName, type }) =>
            onCreateActivityLog({
              language,
              timezone: timeZone as string,
              date: currentActiveDay,
              type,
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
              type: 'excuse_logged_daily_checkin',
              details: {
                excuseReason: skipReason ?? '',
              },
            }).then(() => {
              activitySkippedModal.dismiss();
            })
          }
        />
        <DailyActivityModal
          ref={dailyActivityModal.ref}
          onAddActivity={() =>
            activityCompleteModal.present({
              type: 'custom_activity',
            })
          }
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
