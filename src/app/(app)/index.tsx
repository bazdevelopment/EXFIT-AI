import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
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
import { useGetAllUserConversations } from '@/api/conversation/conversation.hooks';
import { useGetAllExcuseBusterConversations } from '@/api/excuse-buster-conversation/excuse-buster-conversation.hooks';
import { useFetchUserNotifications } from '@/api/push-notifications/push-notifications.hooks';
import { useOwnedPurchasedItems, useRepairStreak } from '@/api/shop/shop.hooks';
import { useUser } from '@/api/user/user.hooks';
import ActivityPromptBanner from '@/components/banners/activity-prompt-banner';
import AICoachBanner from '@/components/banners/ai-coach-banner';
import MotivationBanner from '@/components/banners/motivation-banner';
import CalendarMiniView from '@/components/calendar-mini-view';
import CustomAlert from '@/components/custom-alert';
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
import { MAX_DAILY_ACTIVITIES } from '@/constants/limits';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import { useDelayedRefetch } from '@/core/hooks/use-delayed-refetch';
import { useRefetchOnFocus } from '@/core/hooks/use-refetch-on-focus';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { avatars, type TAvatarGender } from '@/core/utilities/avatars';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';
import { generateWeekDataOverview } from '@/core/utilities/generate-week-data-overview';
import { requestAppRatingWithDelay } from '@/core/utilities/request-app-review';

// eslint-disable-next-line max-lines-per-function
export default function Home() {
  const { language } = useSelectedLanguage();
  const { data: userInfo, refetch: refetchUserInfo } = useUser(language);
  const completedScans = userInfo?.completedScans || 0;
  const activityCompleteModal = useModal();
  const activitySkippedModal = useModal();
  const dailyActivityModal = useModal();
  const activityLogSuccessModal = useModal();
  const { isUpgradeRequired } = useSubscriptionAlert();
  console.log('isUpgradeRequired', isUpgradeRequired);
  console.log(
    ' userInfo.totalActivitiesPerWeekForFree',
    userInfo.maxExcuseBusterConversationsForFree
  );
  const { data: userNotifications, refetch: refetchUserNotifications } =
    useFetchUserNotifications({
      userId: userInfo?.userId,
      language,
    })();
  const { data: allConversations, refetch: refetchAllUsersConversations } =
    useGetAllUserConversations({
      userId: userInfo.userId,
      limit: 10,
    });

  const {
    data: excuseBusterConversations,
    refetch: refetchAllExcuseBusterConversations,
  } = useGetAllExcuseBusterConversations({
    userId: userInfo.userId,
    limit: 10,
  });

  const coachConversationsLength = allConversations?.count || 0;
  const excuseBusterConversationsCount = excuseBusterConversations?.count || 0;
  console.log('excuseBusterConversationsCount', excuseBusterConversationsCount);
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

  useRefetchOnFocus(() => {
    refetchAllExcuseBusterConversations();
    refetchAllUsersConversations();
  });

  const {
    segmentedDays,
    currentMonth,
    currentYear,
    initialDayFocused,
    currentMonthNumber,
    startOfWeek,
    endOfWeek,
    weekOffset,
    currentDayNumber,
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

  const todayDateKey = `${currentYear}-${currentMonthNumber}-${currentDayNumber}`;

  const isActivitiesLimitReached =
    currentWeekActivityLogs?.[todayDateKey]?.length >= MAX_DAILY_ACTIVITIES;

  const totalActivitiesPerWeek = currentWeekActivityLogs
    ? Object.values(currentWeekActivityLogs)?.filter(Boolean)?.flat()?.length
    : 0;

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

  /* *ask for rating */
  useEffect(() => {
    if (
      completedScans === userInfo.maxScansForFree ||
      excuseBusterConversationsCount === 5 ||
      coachConversationsLength === 5
    ) {
      requestAppRatingWithDelay(1000);
    }
  }, [
    completedScans,
    coachConversationsLength,
    excuseBusterConversationsCount,
    userInfo.maxScansForFree,
  ]);

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
              statuses={extractStatusesFromDay(
                currentWeekActivityLogs?.[currentActiveDay]
              )}
              onAddActivity={() => {
                if (
                  isUpgradeRequired &&
                  totalActivitiesPerWeek >=
                    userInfo.totalActivitiesPerWeekForFree
                ) {
                  return Toast.showCustomToast(
                    <CustomAlert
                      title={'Dear user,'}
                      subtitle={
                        'Upgrade Your Plan to Unlock This Feature 🔓 — Enjoy powerful AI fitness tools, exclusive features, and all-in-one support to help you crush your goals and stay motivated! 💪'
                      }
                      buttons={[
                        {
                          label: translate('components.UpgradeBanner.heading'),
                          variant: 'default',
                          onPress: () => router.navigate('/paywall-new'),
                          // a small delay in mandatory for Toast, not sure why
                          buttonTextClassName: 'dark:text-white',
                          className:
                            'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
                        },
                      ]}
                    />,
                    {
                      duration: 10000000,
                    }
                  );
                }
                activityCompleteModal.present({
                  type: 'custom_activity',
                  date: currentActiveDay,
                });
              }}
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
            isUpgradeRequired={
              isUpgradeRequired &&
              excuseBusterConversationsCount >=
                userInfo.maxExcuseBusterConversationsForFree
            }
          />
          <AICoachBanner
            containerClassName="mt-4"
            showUpgradeBanner={
              isUpgradeRequired &&
              coachConversationsLength >=
                userInfo.maxAiCoachConversationsForFree
            }
          />
        </View>
      </ScrollView>
      <DailyCheckInModal
        ref={activityCompleteModal.ref}
        isActivitiesLimitReached={isActivitiesLimitReached}
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
        onGoToExcuseBuster={() => {
          if (
            isUpgradeRequired &&
            totalActivitiesPerWeek >= userInfo.totalActivitiesPerWeekForFree
          ) {
            return Toast.showCustomToast(
              <CustomAlert
                title={'Dear user,'}
                subtitle={
                  'Upgrade Your Plan to Unlock This Feature 🔓 — Enjoy powerful AI fitness tools, exclusive features, and all-in-one support to help you crush your goals and stay motivated! 💪'
                }
                buttons={[
                  {
                    label: translate('components.UpgradeBanner.heading'),
                    variant: 'default',
                    onPress: () => router.navigate('/paywall-new'),
                    // a small delay in mandatory for Toast, not sure why
                    buttonTextClassName: 'dark:text-white',
                    className:
                      'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
                  },
                ]}
              />,
              {
                duration: 10000000,
              }
            );
          }

          router.navigate('/excuse-buster');
        }}
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
        onAddActivity={(date) => {
          if (
            isUpgradeRequired &&
            totalActivitiesPerWeek >= userInfo.totalActivitiesPerWeekForFree
          ) {
            return Toast.showCustomToast(
              <CustomAlert
                title={'Dear user,'}
                subtitle={
                  'Upgrade Your Plan to Unlock This Feature 🔓 — Enjoy powerful AI fitness tools, exclusive features, and all-in-one support to help you crush your goals and stay motivated! 💪'
                }
                buttons={[
                  {
                    label: translate('components.UpgradeBanner.heading'),
                    variant: 'default',
                    onPress: () => router.navigate('/paywall-new'),
                    // a small delay in mandatory for Toast, not sure why
                    buttonTextClassName: 'dark:text-white',
                    className:
                      'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
                  },
                ]}
              />,
              {
                duration: 10000000,
              }
            );
          }
          activityCompleteModal.present({
            type: 'custom_activity',
            date,
          });
        }}
      />

      <ActivityLogSuccessModal
        ref={activityLogSuccessModal.ref}
        onCloseModal={activityLogSuccessModal.dismiss}
      />
    </ScreenWrapper>
  );
}

const extractStatusesFromDay = (dayActivities: any[]) => {
  return (
    dayActivities?.map((activity) => activity?.status).filter(Boolean) || []
  );
};
