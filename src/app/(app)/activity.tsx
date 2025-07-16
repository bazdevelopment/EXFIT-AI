/* eslint-disable max-lines-per-function */
import { useScrollToTop } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { getCalendars } from 'expo-localization';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import {
  useCreateActivityLog,
  useGetCalendarActivityLog,
} from '@/api/activity-logs/activity-logs.hooks';
import CompactActivityCard from '@/components/activity-card';
import { ActivityLogSuccessModal } from '@/components/modals/activity-log-success-modal';
import { DailyCheckInModal } from '@/components/modals/daily-check-in-modal';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, Text, useModal } from '@/components/ui';
import WeekBlock from '@/components/week-block';
import { DATE_FORMAT } from '@/constants/date-format';
import { DEVICE_TYPE } from '@/core';
import { useDelayedRefetch } from '@/core/hooks/use-delayed-refetch';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { checkIsToday } from '@/core/utilities/date-time-helpers';
import { formatDate } from '@/core/utilities/format-date';

const Activity = () => {
  const scrollViewRef = useRef<FlashList<any>>(null);
  const {
    i18n: { language },
  } = useTranslation();
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
  } = useWeekNavigation();

  const activityCompleteModal = useModal();
  const activityLogSuccessModal = useModal();

  const {
    mutateAsync: onCreateActivityLog,
    isPending: isCreateActivityLogPending,
  } = useCreateActivityLog({ onSuccess: activityLogSuccessModal.present });
  const [currentActiveDay, setCurrentActiveDay] = useState('');
  // const today = getCurrentDay('YYYY-MM-DD', language);

  const { isRefetching, onRefetch } = useDelayedRefetch(() => {});
  const { data: currentWeekActivityLog } = useGetCalendarActivityLog({
    startDate: startOfWeek,
    endDate: endOfWeek,
    language,
  });

  // const totalTodayActivities = currentWeekActivityLog?.[today]?.length;
  // State to hold the actual height of the WeekBlock header.
  const [headerHeight, setHeaderHeight] = useState(0);
  // Use the custom hook, passing the dynamically determined headerHeight.
  const { animatedHeaderStyle, onScroll } = useScrollToHideHeader(headerHeight);

  const onHeaderLayout = useCallback(
    (event) => {
      const { height } = event.nativeEvent.layout;
      if (height > 0 && headerHeight === 0) {
        setHeaderHeight(height);
      }
    },
    [headerHeight]
  );
  useScrollToTop(scrollViewRef);

  const scrollToTop = () => {
    scrollViewRef.current?.scrollToIndex({
      index: 0,
      animated: true,
    });
  };

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

  const records = currentWeekActivityLog || {};

  const cardTitle = {
    attended: 'Active',
    skipped: 'Skipped',
    inactive: 'Inactive',
  };

  // Prepare flat data for FlashList
  const flashListData = useMemo(() => {
    return Object.entries(records)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)) // Sort by date
      .map(([date, recordsForDate]) => ({
        id: date,
        date,
        records: recordsForDate, // can be null or an array
      }));
  }, [records]);

  const renderItem = useCallback(
    ({ item }) => (
      <View className="mb-2 border-b-[0.5px] border-white/10">
        <View className="flex-row items-center justify-between py-2">
          <Text className="font-bold-poppins text-xl text-[#3195FD]">
            {formatDate(item.date, DATE_FORMAT.weekDayMonth, language)}
          </Text>
          {checkIsToday(item.date, language) && (
            <TouchableOpacity
              onPress={() => {
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
                Add Activity
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!item.records || item.records.length === 0 ? (
          <View className="mb-2 rounded-lg">
            <Text className="ml-[1] font-primary-poppins text-white">
              No physical activity noted for this day
            </Text>
          </View>
        ) : (
          <View className="mt-2 gap-4">
            {item.records.map((record, index) => {
              return (
                <CompactActivityCard
                  key={`${item.date}-${index}`} // Unique key
                  title={cardTitle[record.status]}
                  status={record.status}
                  outcome={
                    record.details.excuseReason || record.details.activityName
                  }
                  gemsEarned={record.gemsEarned} // Dynamic value
                  xpEarned={record.xpEarned} // Dynamic value
                />
              );
            })}
          </View>
        )}
      </View>
    ),
    [language]
  );

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
            paddingTop: 50,
          },
        ]} // Ensure background covers content when sliding
        className="absolute inset-x-0 top-0 w-full" // Use NativeWind classes for absolute positioning
      >
        <View className="px-6">
          <Text className="mb-2 font-bold-poppins text-3xl text-white">
            Schedule
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
        ref={scrollViewRef}
        data={flashListData}
        renderItem={renderItem}
        estimatedItemSize={150}
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
          paddingTop: headerHeight - (DEVICE_TYPE.IOS ? 60 : 10),
        }}
        keyExtractor={(item) => item.id}
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
      <DailyCheckInModal
        ref={activityCompleteModal.ref}
        isCreateActivityLogPending={isCreateActivityLogPending}
        onSubmit={({ durationMinutes, activityName, type }) =>
          onCreateActivityLog({
            timezone: timeZone as string,
            language,
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
