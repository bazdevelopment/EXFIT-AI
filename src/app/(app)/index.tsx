import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useCreateActivityLog,
  useGetCalendarActivityLog,
  useUpdateActivityLog,
} from '@/api/activity-logs/activity-logs.hooks';
import { useUpdateAiTaskNotes } from '@/api/ai-tasks/ai-tasks.hooks';
import { useFetchUserNotifications } from '@/api/push-notifications/push-notifications.hooks';
import { useOwnedPurchasedItems, useRepairStreak } from '@/api/shop/shop.hooks';
import { useUser } from '@/api/user/user.hooks';
import ActivityPromptBanner from '@/components/banners/activity-prompt-banner';
import AICoachBanner from '@/components/banners/ai-coach-banner';
import MotivationBanner from '@/components/banners/motivation-banner';
import UpgradeBanner from '@/components/banners/upgrade-banner';
import CalendarMiniView from '@/components/calendar-mini-view';
import DailyCheckInStatus from '@/components/daily-check-in-status';
import Greeting from '@/components/greeting';
import Icon from '@/components/icon';
import { ActivityLogSuccessModal } from '@/components/modals/activity-log-success-modal';
import { DailyActivityModal } from '@/components/modals/daily-activity-modal';
import { DailyCheckInModal } from '@/components/modals/daily-check-in-modal';
import { NoActivityLogModal } from '@/components/modals/no-activity-log-modal';
import { type INotificationItem } from '@/components/notifications/notification-item/notification-item.interface';
import RewardsOverview from '@/components/rewards-overview';
import ScreenWrapper from '@/components/screen-wrapper';
import TaskListOverview from '@/components/task-list-overview';
import Toast from '@/components/toast';
import { colors, Image, useModal } from '@/components/ui';
import { BellIcon, ShoppingCart } from '@/components/ui/assets/icons';
import { DEVICE_TYPE, useSelectedLanguage } from '@/core';
import { useDelayedRefetch } from '@/core/hooks/use-delayed-refetch';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { avatars, type TAvatarGender } from '@/core/utilities/avatars';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';
import { generateWeekDataOverview } from '@/core/utilities/generate-week-data-overview';

// eslint-disable-next-line max-lines-per-function
export default function Home() {
  const { language } = useSelectedLanguage();
  const { data: userInfo, refetch: refetchUserInfo } = useUser(language);
  const activityCompleteModal = useModal();
  const activitySkippedModal = useModal();
  const dailyActivityModal = useModal();
  const activityLogSuccessModal = useModal();
  const { isUpgradeRequired } = useSubscriptionAlert();
  const { data: userNotifications, refetch: refetchUserNotifications } =
    useFetchUserNotifications({
      userId: userInfo?.userId,
      language,
    })();

  const { data: ownPurchasedData, refetch: refetchOwnedShopItems } =
    useOwnedPurchasedItems();

  const unReadMessages = userNotifications?.notifications.filter(
    (notification: INotificationItem) => !notification.isRead
  );
  const hasUnreadMessages = !!unReadMessages?.length;

  const [{ timeZone }] = getCalendars();

  const currentActiveDay = getCurrentDay('YYYY-MM-DD', language);

  const lastResetStreakDates = userInfo?.gamification.streakResetDates;
  const streakFreezeUsageDates = userInfo?.gamification?.streakFreezeUsageDates;
  const streakRepairDates = userInfo?.gamification?.streakRepairDates;
  const lastTimeLostStreakTimestamp =
    userInfo?.gamification?.lostStreakTimestamp;
  const lostStreakValue = userInfo?.gamification?.lostStreakValue;

  const foundElixirShopItem = ownPurchasedData?.items?.find(
    (shopItem) => shopItem.id === 'STREAK_REVIVAL_ELIXIR'
  );
  const hasUserRepairStreakElixir = foundElixirShopItem?.quantity > 0;
  // const lastResetStreakDate = userInfo?.gamification.lostStreakTimestamp
  //   ? dayjs(userInfo?.gamification.lostStreakTimestamp).format('YYYY-MM-DD')
  //   : '';

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
  } = useCreateActivityLog({
    onSuccess: ({ gemsReward, xpReward }) =>
      activityLogSuccessModal.present({
        gemsReward: gemsReward,
        xpReward: xpReward,
      }),
  });

  const { mutateAsync: onUpdateActivityLog } = useUpdateActivityLog();

  const { data: currentWeekActivityLogs, refetch: refetchActivityLog } =
    useGetCalendarActivityLog({
      startDate: startOfWeek,
      endDate: endOfWeek,
      language,
    });

  const generatedWeekData = generateWeekDataOverview({
    currentWeekActivityLog: currentWeekActivityLogs,
    segmentedDays,
    lastResetStreakDates,
    initialDayFocused,
    streakFreezeUsageDates,
    streakRepairDates,
    lastTimeLostStreakTimestamp,
    lostStreakValue,
  });

  const { mutate: onAddNotes } = useUpdateAiTaskNotes();

  // First, transform your array into an object with date keys
  const generatedWeekDataMapped = generatedWeekData.reduce((acc, record) => {
    const dateKey = record.dateKey; // or however you get the date from your record
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);

    return acc;
  }, {});

  const todayActiveTasks = currentWeekActivityLogs?.[currentActiveDay]?.filter(
    (task) => task.type === 'custom_ai_task'
  );
  const { mutate: onRepairStreak, isPending: isRepairStreakPending } =
    useRepairStreak({
      onSuccessCallback: dailyActivityModal.ref.current?.dismiss,
    });
  const isDailyCheckInDone = !!currentWeekActivityLogs?.[currentActiveDay];

  const { isRefetching, onRefetch } = useDelayedRefetch(() => {
    refetchActivityLog();
    refetchUserInfo();
    refetchUserNotifications();
    refetchOwnedShopItems();
  });

  return (
    <ScreenWrapper>
      <View
        className={`${DEVICE_TYPE.IOS ? '-mt-1' : 'mt-1'} flex-row justify-between`}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.navigate('/profile')}>
            <Image
              source={avatars[userInfo.onboarding.gender as TAvatarGender]}
              className="mx-4 size-12  rounded-full bg-white/20" // Tailwind classes for styling the avatar
              accessibilityLabel="User Avatar"
            />
          </TouchableOpacity>

          <RewardsOverview
            userName={userInfo?.userName}
            gemsBalance={userInfo?.gamification?.gemsBalance}
            xpBalance={userInfo?.gamification.xpTotal}
            streakBalance={userInfo?.gamification.currentStreak}
            showStreaks={false}
          />
        </View>
        <View className="flex-row gap-7">
          <Icon
            icon={<ShoppingCart />}
            iconContainerStyle="items-center p-2.5 self-start rounded-full border-[1px] border-charcoal-800"
            size={20}
            color={colors.white}
            onPress={() => router.navigate('/shopping-cart')}
          />
          <Icon
            icon={<BellIcon />}
            onPress={() => router.navigate('/notifications')}
            size={22}
            color={colors.charcoal[800]}
            iconContainerStyle="p-2 border-[1px] border-charcoal-800 rounded-full"
            showBadge={hasUnreadMessages}
            badgeSize={9}
            badgeColor={colors.danger[600]}
            badgeClassName="right-0"
            containerStyle="right-4"
          />
        </View>
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
          textClassName="text-white dark:text-white"
        />
        {isUpgradeRequired && <UpgradeBanner />}

        <View className="mx-1 rounded-2xl bg-[#191A21] pb-2">
          {currentWeekActivityLogs && (
            <CalendarMiniView
              showMonth
              showYear
              showStreak
              currentStreak={userInfo?.gamification?.currentStreak}
              containerClassName="mx-2 mt-2 p-1"
              currentWeekActivityLog={currentWeekActivityLogs}
              segmentedDays={segmentedDays}
              currentMonth={currentMonth}
              currentYear={currentYear}
              initialDayFocused={initialDayFocused}
              currentMonthNumber={currentMonthNumber}
              weekOffset={weekOffset}
              lastResetStreakDates={lastResetStreakDates}
              onDayPress={(data) => dailyActivityModal.present(data)}
              streakFreezeUsageDates={streakFreezeUsageDates}
              streakRepairDates={streakRepairDates}
              lastTimeLostStreakTimestamp={lastTimeLostStreakTimestamp}
              lostStreakValue={lostStreakValue}
            />
          )}
          {!isDailyCheckInDone ? (
            <ActivityPromptBanner
              containerClassName="mt-2"
              onShowActivityCompleteModal={() =>
                activityCompleteModal.present({
                  type: 'daily_checkin',
                  date: currentActiveDay,
                })
              }
              onShowActivitySkippedModal={activitySkippedModal.present}
            />
          ) : (
            <DailyCheckInStatus
              additionalClassname="mt-2"
              status={currentWeekActivityLogs?.[currentActiveDay][0]?.status}
              onAddActivity={() =>
                activityCompleteModal.present({
                  type: 'custom_activity',
                  date: currentActiveDay,
                })
              }
            />
          )}

          {!!todayActiveTasks?.length && (
            <TaskListOverview
              tasks={todayActiveTasks}
              onCompleteTask={(task) =>
                onUpdateActivityLog({
                  language,
                  logId: task.id as string,
                  fieldsToUpdate: { status: 'completed' },
                }).then(() => {
                  activityLogSuccessModal.present({
                    gemsReward: task.gemsEarned, // Example value, replace with actual logic
                    xpReward: task.xpEarned, // Example value, replace with actual logic
                  });
                })
              }
              // onSkipTask={(activityLogId) => {
              //   onUpdateActivityLog({
              //     language,
              //     logId: activityLogId,
              //     fieldsToUpdate: { status: 'skipped' },
              //   });
              // }}
              additionalClassName="bg-black mt-2 mx-2 py-4 rounded-xl"
            />
          )}
        </View>

        <View className="mx-2">
          <MotivationBanner
            containerClassName="mt-4"
            isUpgradeRequired={isUpgradeRequired}
          />
          <AICoachBanner
            containerClassName="mt-4"
            isUpgradeRequired={isUpgradeRequired}
          />
        </View>

        <DailyCheckInModal
          ref={activityCompleteModal.ref}
          isCreateActivityLogPending={isCreateActivityLogPending}
          onSubmit={({ durationMinutes, activityName, type, date }) =>
            onCreateActivityLog({
              language,
              timezone: timeZone as string,
              date,
              type,
              durationMinutes,
              activityName,
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
              excuseReason: skipReason ?? '',
            }).then(() => {
              activitySkippedModal.dismiss();
            })
          }
        />
        <DailyActivityModal
          ref={dailyActivityModal.ref}
          hasUserRepairStreakElixir={hasUserRepairStreakElixir}
          isRepairStreakPending={isRepairStreakPending}
          onRepairStreak={onRepairStreak}
          onAddNotes={({ taskId, notes }) =>
            onUpdateActivityLog({
              language,
              logId: taskId as string,
              fieldsToUpdate: { notes },
            }).then(() => {
              Toast.success('Notes saved! 📝 All set.');
            })
          }
          currentWeekActivityLogs={generatedWeekDataMapped}
          onAddActivity={(date) =>
            activityCompleteModal.present({
              type: 'custom_activity',
              date,
            })
          }
        />

        <ActivityLogSuccessModal
          ref={activityLogSuccessModal.ref}
          onCloseModal={activityLogSuccessModal.dismiss}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
