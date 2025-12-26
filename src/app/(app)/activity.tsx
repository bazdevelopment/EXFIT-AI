/* eslint-disable max-lines-per-function */
import { useScrollToTop } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import { GAMIFICATION_REWARDS_CONFIG } from 'functions/utilities/rewards-pricing';
import React, { useCallback, useRef, useState } from 'react';
import {
  RefreshControl,
  type ScrollView,
  type ScrollViewProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  useCreateActivityLog,
  useGetCalendarActivityLog,
  useUpdateActivityLog,
} from '@/api/activity-logs/activity-logs.hooks';
import { useOwnedPurchasedItems, useRepairStreak } from '@/api/shop/shop.hooks';
import { useUser } from '@/api/user/user.hooks';
import ActivitiesList from '@/components/activities-list';
import CustomAlert from '@/components/custom-alert';
import { ActivityLogSuccessModal } from '@/components/modals/activity-log-success-modal';
import { DailyCheckInModal } from '@/components/modals/daily-check-in-modal';
import ScreenWrapper from '@/components/screen-wrapper';
import StreakWarning from '@/components/streak-warning';
import Toast from '@/components/toast';
import { colors, Image, Text, useModal } from '@/components/ui';
import WeekBlock from '@/components/week-block';
import { DATE_FORMAT } from '@/constants/date-format';
import { MAX_DAILY_ACTIVITIES } from '@/constants/limits';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import { useDelayedRefetch } from '@/core/hooks/use-delayed-refetch';
import { useRefetchOnFocus } from '@/core/hooks/use-refetch-on-focus';
import useRemoteConfig from '@/core/hooks/use-remote-config';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { checkIsToday } from '@/core/utilities/date-time-helpers';
import { formatDate } from '@/core/utilities/format-date';
import { generateWeekDataOverview } from '@/core/utilities/generate-week-data-overview';
import { wait } from '@/core/utilities/wait';

const _RenderScrollComponent = React.forwardRef<ScrollView, ScrollViewProps>(
  (props, ref) => <KeyboardAwareScrollView {...props} ref={ref} />
);

const Activity = () => {
  const scrollViewRef = useRef<FlashList<any>>(null);

  const { language } = useSelectedLanguage();

  const [{ timeZone }] = getCalendars();

  const {
    weekOffset,
    segmentedDays,
    interval,
    weekNumber,
    currentMonth,
    currentYear,
    initialDayFocused,
    changeWeekOffset,
    currentMonthNumber,
    startOfWeek,
    endOfWeek,
    currentDay,
    currentDayNumber,
  } = useWeekNavigation();
  const activityCompleteModal = useModal();
  const activityLogSuccessModal = useModal();
  const { data: userInfo } = useUser(language);
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

  const [currentActiveDay, setCurrentActiveDay] = useState('');
  const elixirPrice =
    GAMIFICATION_REWARDS_CONFIG.shopItems.STREAK_REVIVAL_ELIXIR.costInGems;
  const { mutate: onRepairStreak, isPending: isRepairStreakPending } =
    useRepairStreak({});

  const { data: ownPurchasedData, refetch: refetchOwnedShopItems } =
    useOwnedPurchasedItems();
  const { isUpgradeRequired } = useSubscriptionAlert();

  // const today = getCurrentDay('YYYY-MM-DD', language);
  const todayDateKey = `${currentYear}-${currentMonthNumber}-${currentDayNumber}`;
  const { data: currentWeekActivityLog, refetch: onRefetchActivityLog } =
    useGetCalendarActivityLog({
      startDate: startOfWeek,
      endDate: endOfWeek,
      language,
    });

  const { TOTAL_FREE_ACTIVITIES_FREE_TRIAL } = useRemoteConfig();

  const isActivitiesLimitReached =
    currentWeekActivityLog?.[todayDateKey]?.length >= MAX_DAILY_ACTIVITIES;
  const { isRefetching, onRefetch } = useDelayedRefetch(() => {
    //add here logic to refetch
    onRefetchActivityLog();
  });
  // const totalTodayActivities = currentWeekActivityLog?.[today]?.length;
  // State to hold the actual height of the WeekBlock header.
  const [headerHeight, setHeaderHeight] = useState(0);
  // Use the custom hook, passing the dynamically determined headerHeight.
  const { animatedHeaderStyle, onScroll } = useScrollToHideHeader(headerHeight);

  const onHeaderLayout = useCallback(
    (event) => {
      const { height } = event.nativeEvent.layout;
      //trick to make sure that header height has the right value (sometimes it has a value and after a few ms it was updated with another value)
      wait(1000).then(() => {
        if (height > 0 && headerHeight === 0) {
          setHeaderHeight(height);
        }
      });
    },
    [headerHeight]
  );
  useScrollToTop(scrollViewRef);
  /**Trigger the refetch on focus to get the latest data */
  useRefetchOnFocus(() => {
    onRefetchActivityLog();
  });

  const onScrollToIndex = (record) => {
    const indexToScroll = findSectionIndexToScroll(
      record.dateKey,
      currentWeekActivityLog
    );
    typeof indexToScroll === 'number' &&
      scrollViewRef.current?.scrollToIndex({
        index: indexToScroll,
        animated: true,
      });
  };

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

  const totalActivitiesPerWeek = currentWeekActivityLog
    ? Object.values(currentWeekActivityLog)?.filter(Boolean)?.flat()?.length
    : 0;

  const generatedWeekData = generateWeekDataOverview({
    currentWeekActivityLog,
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

  // Prepare flat data for FlashList
  const flashListData = Object.entries(generatedWeekDataMapped)
    // .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)) // Sort by date
    .map(([date, recordsForDate]) => ({
      id: date,
      date,
      records: recordsForDate, // can be null or an array
    }));

  const handleRepairStreak = (lostStreakValue: number) => {
    if (!hasUserRepairStreakElixir) {
      Toast.showCustomToast(
        <CustomAlert
          visible
          image={
            <Image
              source={require('../../components/ui/assets/images/shop/streak-revival-elixir.png')}
              className="size-[80]"
            />
          }
          title={translate('components.DailyActivityModal.streakBroken')}
          subtitle={translate('components.DailyActivityModal.buyRepairStreak', {
            elixirPrice,
          })}
          buttons={[
            {
              label: translate('components.DailyActivityModal.loseStreak'),
              variant: '',
              onPress: () => Toast.dismiss(),
              className:
                'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
              buttonTextClassName: 'text-white dark:text-white text-sm',
            },
            {
              label: translate('components.DailyActivityModal.buyStreak'),
              variant: '',
              onPress: () => {
                // router.navigate('/shop');
                router.push({
                  pathname: `/shop`,
                  params: { displayProductName: 'STREAK_REVIVAL_ELIXIR' },
                });
                // ref.current.dismiss();
              },
              buttonTextClassName:
                'text-white dark:text-white text-sm text-center',
              className:
                'flex-1 rounded-full h-[48] bg-[#4E52FB] dark:bg-[#4E52FB] active:opacity-80',
            },
          ]}
        />,
        {
          duration: 10000000,
        }
      );
      return;
    }

    Toast.showCustomToast(
      <CustomAlert
        visible
        image={
          <Image
            source={require('../../components/ui/assets/images/shop/streak-revival-elixir.png')}
            className="size-[80]"
          />
        }
        title={translate('components.DailyActivityModal.streakRestore')}
        subtitle={translate('components.DailyActivityModal.restorationStreak', {
          lostStreakValue,
        })}
        buttons={[
          {
            label: translate('components.DailyActivityModal.loseStreak'),
            variant: '',
            onPress: () => Toast.dismiss(),
            className:
              'flex-1 rounded-full bg-transparent dark:bg-transparent border border-white dark:border-white h-[48]',
            buttonTextClassName: 'text-white dark:text-white text-sm',
          },
          {
            label: translate('components.DailyActivityModal.applyElixir'),
            variant: '',
            onPress: onRepairStreak,
            buttonTextClassName:
              'text-white dark:text-white text-sm text-center',
            className:
              'flex-1 rounded-full h-[48] bg-[#4E52FB] dark:bg-[#4E52FB] active:opacity-80',
          },
        ]}
      />,
      {
        duration: 10000000,
      }
    );
  };

  const renderItem = ({ item }) => {
    const data = item.records[0];
    const isToday = checkIsToday(
      formatDate(item.date, 'YYYY-MM-DD', language),
      language
    );
    return (
      <View className="mb-2 border-b-[0.5px] border-white/10">
        <View className="flex-row items-center justify-between py-2">
          <Text className="font-bold-poppins text-xl text-[#3195FD]">
            {formatDate(item.date, DATE_FORMAT.weekDayMonth, language)}
          </Text>
          {isToday && (
            <TouchableOpacity
              onPress={() => {
                if (
                  isUpgradeRequired &&
                  totalActivitiesPerWeek >= TOTAL_FREE_ACTIVITIES_FREE_TRIAL
                ) {
                  return Toast.showCustomToast(
                    <CustomAlert
                      title={`${translate('general.dearUser')},`}
                      subtitle={translate(
                        'components.UpgradeBanner.upgradeMessage'
                      )}
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

                setCurrentActiveDay(
                  formatDate(item.date, 'YYYY-MM-DD', language)
                );
                activityCompleteModal.present({ type: 'custom_activity' });
              }}
              className="flex-row items-center rounded-full bg-[#4E52FB] px-3 py-1 dark:bg-[#4E52FB]"
            >
              <Text className="font-medium-poppins text-xl text-white">+</Text>
              {/* <PlusIcon /> */}
              <Text className="ml-2 font-semibold-poppins text-sm text-white">
                {translate('components.DailyCheckInForm.addActivity')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Streak Reset Warning */}
        <StreakWarning
          isStreakReset={data?.isStreakReset}
          isStreakFreezeUsed={data?.isStreakFreezeUsed}
          isStreakRepaired={data?.isStreakRepaired}
          isElixirUsageExpired={data?.isElixirUsageExpired}
          onRepairStreak={() => handleRepairStreak(data?.lostStreakValue)}
          isRepairStreakPending={isRepairStreakPending}
        />

        <ActivitiesList
          showInModal={false}
          showHeading={false}
          activities={data.activities}
          onAddActivity={() => {
            if (
              isUpgradeRequired &&
              totalActivitiesPerWeek >= TOTAL_FREE_ACTIVITIES_FREE_TRIAL
            ) {
              return Toast.showCustomToast(
                <CustomAlert
                  title={`${translate('general.dearUser')},`}
                  subtitle={translate(
                    'components.UpgradeBanner.upgradeMessage'
                  )}
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
            setCurrentActiveDay(formatDate(item.date, 'YYYY-MM-DD', language));
            activityCompleteModal.present({ type: 'custom_activity' });
          }}
          isToday={isToday}
          onAddNotes={({ taskId, notes }) =>
            onUpdateActivityLog({
              language,
              logId: taskId as string,
              fieldsToUpdate: { notes },
            }).then(() => {
              Toast.success(translate('alerts.notesSavedSuccess'));
            })
          }
        />
      </View>
    );
  };

  return (
    <ScreenWrapper>
      {/*
        Wrap WeekBlock in an Animated.View.
        Apply the animatedHeaderStyle from the hook.
        Set onLayout to capture its height, which is then used by the hook.
        Add a background color to hide content that might scroll underneath.
      */}
      <Animated.View
        onLayout={onHeaderLayout}
        style={[
          animatedHeaderStyle,
          {
            backgroundColor: colors.black,
            zIndex: 100,
            paddingTop: 40,
          },
        ]} // Ensure background covers content when sliding
        className="absolute inset-x-0 w-full" // Use NativeWind classes for absolute positioning
      >
        {/* {isUpgradeRequired && <UpgradeBanner />} */}

        <View className="px-6">
          <Text className="mb-2 font-bold-poppins text-3xl text-white">
            {translate('general.schedule')}
          </Text>
        </View>

        <WeekBlock
          className="px-4"
          onDayPress={onScrollToIndex} // This can be removed if not used
          weekOffset={weekOffset}
          initialDayFocused={initialDayFocused}
          changeWeekOffset={changeWeekOffset}
          weekNumber={weekNumber}
          currentMonth={currentMonth}
          interval={interval}
          currentYear={currentYear}
          segmentedDays={segmentedDays}
          currentMonthNumber={currentMonthNumber}
          startOfWeek={startOfWeek}
          endOfWeek={endOfWeek}
        />
      </Animated.View>

      <FlashList
        //! consider using RenderScrollComponent but be careful on opening "add activity" modal, the content has a weird behavior
        // renderScrollComponent={RenderScrollComponent}

        ref={scrollViewRef}
        data={flashListData}
        /** //! this combination together with keyExtractor and useRefetchOnFocus trigger a re-rendering  */
        extraData={[currentWeekActivityLog, flashListData]}
        renderItem={renderItem}
        estimatedItemSize={150}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View className="mb-[500]"></View>}
        onScroll={onScroll}
        // Throttle scroll events for better performance with animations
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 16,
          // Crucial fix: Add headerHeight + REFRESH_CONTROL_OFFSET to paddingTop
          // This ensures enough space is reserved at the top for both the header
          // and the refresh spinner to be visible.
          paddingTop: headerHeight - (DEVICE_TYPE.IOS ? 60 : 25),
        }}
        keyExtractor={(item) =>
          `${item.id}-${item.records[0]?.activities?.length}-${JSON.stringify(item.records[0]?.activities)}`
        } // Better key
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefetch}
            tintColor={colors.white}
            colors={[colors.black]}
            // Set progressViewOffset to position the spinner correctly
            // It should start rendering below your header.
            progressViewOffset={200}
          />
        }
      />
      {/* </KeyboardAvoidingView> */}

      <DailyCheckInModal
        ref={activityCompleteModal.ref}
        isCreateActivityLogPending={isCreateActivityLogPending}
        isActivitiesLimitReached={isActivitiesLimitReached}
        // activityLogs={}
        onSubmit={({ durationMinutes, activityName, type }) =>
          onCreateActivityLog({
            timezone: timeZone as string,
            language,
            date: currentActiveDay,
            type,
            durationMinutes,
            activityName,
          }).then(() => {
            activityCompleteModal.dismiss();
          })
        }
      />
      <ActivityLogSuccessModal
        ref={activityLogSuccessModal.ref}
        onCloseModal={activityLogSuccessModal.dismiss}
      />
    </ScreenWrapper>
  );
};

/**
 * Utility function used to find the section index and element index to scroll
 * slice(8) to extract the last 2 characters from "20-12-22"
 */
const findSectionIndexToScroll = (
  selectedDay: string,
  currentWeekActivityLog: any
): number => {
  return Object.keys(currentWeekActivityLog)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .findIndex((date) => date.includes(selectedDay));
};

/**
 * Custom hook to manage the animated hiding and showing of a header
 * based on scroll direction using React Native Reanimated.
 *
 * @param {number} initialHeaderHeight The maximum height of the header when fully visible.
 * This value should be determined dynamically using `onLayout` for accuracy.
 * @returns {object} An object containing:
 * - animatedHeaderStyle: Styles to apply to the Animated.View wrapper for the header.
 * - onScroll: The scroll event handler to be passed to the FlashList's `onScroll` prop.
 */
export const useScrollToHideHeader = (initialHeaderHeight = 0) => {
  // Use useSharedValue for animated properties.
  // `top` controls the header's vertical position. 0 is fully visible.
  // `-initialHeaderHeight` is fully hidden.
  const top = useSharedValue(0);

  // Ref to store the last known scroll position (contentOffset.y).
  const scrollYRef = useRef(0);

  // A threshold in pixels. Scrolling more than this amount triggers the hide/show animation.
  // This prevents the header from flickering on very small, incidental scrolls.
  const scrollThreshold = 0; // Keeping this at 0 makes the animation very sensitive to any scroll.
  // Consider increasing it slightly (e.g., 5 or 10) for less "jumpy" behavior.

  // useAnimatedStyle to apply the animated `top` property to the header.
  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: top.value }],
    };
  });

  // Callback function to handle scroll events from the FlashList.
  // This is a worklet, so it runs on the UI thread.
  const handleScroll = useCallback(
    (event) => {
      'worklet'; // Add worklet directive for Reanimated
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const scrollDiff = currentScrollY - scrollYRef.current;

      // Only animate if headerHeight is known and significant
      if (initialHeaderHeight > 0) {
        // Scrolling down
        if (scrollDiff > scrollThreshold) {
          // If scrolling down and past a certain point, hide the header
          // Ensure the header doesn't jump back out when scrolling down slightly after hiding
          if (currentScrollY > initialHeaderHeight / 2) {
            top.value = withSpring(-initialHeaderHeight, { damping: 16 });
          }
        }
        // Scrolling up
        else if (scrollDiff < -scrollThreshold) {
          // If scrolling up and near the top, show the header
          // The condition currentScrollY < initialHeaderHeight ensures it fully reappears when close to top
          if (currentScrollY < initialHeaderHeight) {
            // Changed this condition slightly for better behavior
            top.value = withSpring(0, { damping: 16 });
          }
        }
      }

      // Update the last scroll position
      scrollYRef.current = currentScrollY;
    },
    [initialHeaderHeight] // Dependencies for useCallback
  );

  return {
    animatedHeaderStyle,
    onScroll: handleScroll, // The scroll event handler to pass to FlashList
  };
};

export default Activity;
