/* eslint-disable max-lines-per-function */
import { mockInterpretationRecord } from '__mocks__/dashboard-reports';
import { useScrollToTop } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, View } from 'react-native';

import CompactActivityCard from '@/components/activity-card';
import { EndScrollPlaceholder } from '@/components/end-scroll-placeholder';
import ScreenWrapper from '@/components/screen-wrapper';
import { Text } from '@/components/ui';
import WeekBlock from '@/components/week-block';
import { DATE_FORMAT } from '@/constants/date-format';
import { useDelayedRefetch } from '@/core/hooks/use-delayed-refetch';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';
import { formatDate } from '@/core/utilities/format-date';
import {
  type IInterpretationRecord,
  type IInterpretationResult,
} from '@/types/interpretation-report';

const Activity = () => {
  const scrollViewRef = useRef<FlashList<any>>(null);
  const {
    i18n: { language },
  } = useTranslation();
  const { isRefetching, onRefetch } = useDelayedRefetch(() => {});

  useScrollToTop(scrollViewRef);
  const scrollToTop = () => {
    scrollViewRef.current?.scrollToIndex({
      index: 0,
      animated: true,
    });
  };

  const interpretationData = mockInterpretationRecord;
  const {
    weekOffset,
    segmentedDays,
    interval,
    weekNumber,
    currentMonth,
    currentYear,
    initialDayFocused,
    changeWeekOffset,
    startOfWeek,
    endOfWeek,
  } = useWeekNavigation();

  // Helper function to transform daily reports
  const transformDailyReports = (days: IInterpretationResult | null) => {
    if (!days) return [];

    return Object.entries(days).map(([dayIndex, reports]) => ({
      day: dayIndex,
      data: reports || null,
    }));
  };

  // Main sections transformation
  const getSections = (interpretationData: IInterpretationRecord) => {
    if (!interpretationData?.records) {
      return [];
    }
    // Convert object to array, sort by date, and transform data
    return Object.entries(interpretationData.records)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([month, dailyRecords]) => ({
        month,
        data: transformDailyReports(dailyRecords),
      }));
  };

  // Usage
  const sections = getSections(interpretationData);
  const onScrollToIndex = (index: number) => {
    scrollViewRef?.current?.scrollToIndex({ index, animated: true });
  };

  const records = interpretationData?.records || {};
  // Prepare flat data for FlashList
  const flashListData = useMemo(() => {
    return Object.entries(records)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)) // Sort by date
      .map(([date, records]) => ({
        id: date,
        date,
        records,
      }));
  }, [records]);

  const renderItem = ({ item }) => (
    <View className="mb-2 mt-4">
      <View className="flex-row items-center ">
        <Text className="font-bold-nunito text-xl text-[#3195FD]">
          {formatDate(item.date, DATE_FORMAT.weekDayMonth, language)}
        </Text>
      </View>

      {!item.records ? (
        <View className="ml-1 mt-4 rounded-lg">
          <Text className="text-md text-white">No activity for this day</Text>
        </View>
      ) : (
        <View className="mt-4 gap-4">
          {Array.isArray(item.records) &&
            item.records.map((record: IInterpretationResult) => {
              return (
                <CompactActivityCard
                  excusedLog="Too Tired"
                  aiSuggestion="10 Mins Energy Boost"
                  outcome="Did the quick routine!"
                  stakesEarned="100"
                />
              );
            })}
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper>
      <WeekBlock
        className="px-4"
        reportSections={[]}
        // onScrollToIndex={onScrollToIndex}
        weekOffset={weekOffset}
        initialDayFocused={initialDayFocused}
        changeWeekOffset={changeWeekOffset}
        weekNumber={weekNumber}
        currentMonth={currentMonth}
        interval={interval}
        currentYear={currentYear}
        segmentedDays={segmentedDays}
      />
      <FlashList
        // {...panResponder.panHandlers}
        ref={scrollViewRef}
        data={flashListData}
        renderItem={renderItem}
        estimatedItemSize={150}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <EndScrollPlaceholder
            className="mt-[550]"
            onScrollToTop={scrollToTop}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        keyExtractor={(item) => item.id}
        // ListEmptyComponent={
        //   <>
        //     <ReportSkeleton />
        //     <ReportSkeleton />
        //     <ReportSkeleton />
        //     <ReportSkeleton />
        //   </>
        // }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefetch}
            tintColor={'#3195FD'}
          />
        }
      />
    </ScreenWrapper>
  );
};

export default Activity;
