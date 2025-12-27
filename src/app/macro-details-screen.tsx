/* eslint-disable max-lines-per-function */
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import {
  useDeleteMacroEntry,
  useGetMacrosDateRange,
} from '@/api/macro/macro.hooks';
import { type Meal } from '@/api/macro/macro.types';
import { useUser } from '@/api/user/user.hooks';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, Text } from '@/components/ui';
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  CloseIcon,
  TrashIcon,
} from '@/components/ui/assets/icons';
import { translate, useSelectedLanguage } from '@/core';
import { useWeekNavigation } from '@/core/hooks/use-week-navigation';

const calculateProgress = (
  totals: MacroTotals,
  goals: MacroGoals
): Promise<MacroProgress> => {
  return {
    calories: goals.calories
      ? parseFloat(((totals.calories * 100) / goals.calories).toFixed(1))
      : 0,
    protein: goals.protein
      ? parseFloat(((totals.protein / goals.protein) * 100).toFixed(1))
      : 0,
    carbs: goals.carbs
      ? parseFloat(((totals.carbs / goals.carbs) * 100).toFixed(1))
      : 0,
    fat: goals.fat
      ? parseFloat(((totals.fat / goals.fat) * 100).toFixed(1))
      : 0,
  };
};

function calculateTotals(meals: Meal[]): MacroTotals {
  return meals.reduce(
    (acc: MacroTotals, meal: Meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

const MealCard = ({ meal, onDelete, order }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleValue }] }}
      className="my-4 overflow-hidden rounded-xl bg-gray-50 dark:bg-black"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text
            className="font-semibold-poppins text-base text-gray-800 dark:text-white"
            numberOfLines={2}
          >
            {order}. {meal.label}
          </Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            {/* {format(meal.createdAt.toDate(), 'h:mm a')} */}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <TrashIcon width={25} height={25} fill={colors.danger[400]} />
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-1 items-center">
          <Text className="font-semibold-poppins text-sm text-gray-500 dark:text-white">
            {translate('components.TodayMacroOverview.calories')}
          </Text>
          <Text className="text-bas font-bold-poppins text-base text-gray-800">
            {meal.calories}
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="font-semibold-poppins text-sm text-gray-500">
            {translate('components.TodayMacroOverview.protein')}
          </Text>
          <Text className="font-bold-poppins text-base text-blue-600 dark:text-blue-400">
            {meal.protein}g
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="font-semibold-poppins text-sm text-gray-500">
            {translate('components.TodayMacroOverview.carbs')}
          </Text>
          <Text className="font-bold-poppins text-base text-amber-600 dark:text-amber-600">
            {meal.carbs}g
          </Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="font-semibold-poppins text-base text-gray-500">
            {translate('components.TodayMacroOverview.fat')}
          </Text>
          <Text className="text-bas font-bold-poppins text-red-500 dark:text-red-400">
            {meal.fat}g
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const DayCard = ({ dayData, goals, onDeleteMeal }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateValue = useRef(new Animated.Value(0)).current;

  const { language } = useSelectedLanguage();

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(rotateValue, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const totals = calculateTotals(dayData?.meals || []);
  const progress = calculateProgress(totals, goals);
  const hasData = dayData.mealsCount > 0;

  return (
    <View className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-primary-600">
      <TouchableOpacity
        onPress={toggleExpand}
        className="p-4"
        activeOpacity={0.7}
      >
        <View className="mb-1 flex-row items-center justify-between">
          <View>
            <Text className="font-bold-poppins text-base text-gray-800 dark:text-white">
              {/* {dayData.date} */}
              {dayjs(dayData.date).locale(language).format('dddd, D MMMM')}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View
              // style={{ transform: [{ rotate: rotation }] }}
              className="flex-row items-center"
            >
              {/* <Text className="text-3xl text-gray-400">⌄</Text> */}
              <Text className="rounded-full border-2 border-white px-3 py-1.5 text-xs">
                {translate('general.seeMore')}
              </Text>
            </View>
          </View>
        </View>
        <Text className="font-medium-poppins text-sm text-green-700 dark:text-white">
          {translate('components.TodayMacroOverview.percentage')}
        </Text>

        {hasData && (
          <View className="flex-row justify-between border-t border-gray-100 pt-3">
            <View className="items-center">
              <View className="mb-1 size-12 items-center justify-center rounded-full dark:bg-green-100">
                <Text className="font-bold-poppins text-base text-blue-600 dark:text-green-700">
                  {Math.round(progress.calories)}%
                </Text>
              </View>
              <Text className="font-semibold-poppins text-sm text-gray-600">
                {totals.calories}
              </Text>
              <Text className="font-semibold-poppins text-sm text-gray-400">
                {translate('components.TodayMacroOverview.calories')}
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-1 size-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-50">
                <Text className="font-bold-poppins text-base text-blue-600 dark:text-blue-600">
                  {Math.round(progress.protein)}%
                </Text>
              </View>
              <Text className="font-semibold-poppins text-sm text-gray-600">
                {totals.protein}g
              </Text>
              <Text className="font-semibold-poppins text-sm text-gray-400">
                {translate('components.TodayMacroOverview.protein')}
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-1 size-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-50">
                <Text className="font-bold-poppins text-base text-amber-600 dark:text-amber-600">
                  {Math.round(progress.carbs)}%
                </Text>
              </View>
              <Text className="font-semibold-poppins text-sm text-gray-600 dark:text-white">
                {totals.carbs}g
              </Text>
              <Text className="font-semibold-poppins text-sm text-gray-400 dark:text-white">
                {translate('components.TodayMacroOverview.carbs')}
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-1 size-12 items-center justify-center rounded-full bg-red-50">
                <Text className="font-bold-poppins text-base text-red-600 dark:text-red-500">
                  {Math.round(progress.fat)}%
                </Text>
              </View>
              <Text className="font-semibold-poppins text-sm text-gray-600">
                {totals.fat}g
              </Text>
              <Text className="font-semibold-poppins text-sm text-gray-400">
                {translate('components.TodayMacroOverview.fat')}
              </Text>
            </View>
          </View>
        )}

        {!hasData && (
          <Text className="text-center text-sm text-gray-400">
            {translate('components.TodayMacroOverview.noMeals')}
          </Text>
        )}
      </TouchableOpacity>

      {expanded && hasData && (
        <View className="border-b border-gray-100 bg-gray-50 p-4 dark:bg-black">
          <Text className="font-semibold-poppins text-base uppercase text-gray-500">
            {translate('components.TodayMacroOverview.meals')} (
            {dayData.mealsCount})
          </Text>
          {dayData.meals.map((meal, index) => (
            <MealCard
              order={index + 1}
              key={meal.id}
              meal={meal}
              onDelete={() =>
                onDeleteMeal({ mealId: meal.id, date: dayData.date })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};

export const GoalsModal = ({
  visible,
  goals,
  onClose,
  onSave,
  language,
  userId,
}) => {
  const [editedGoals, setEditedGoals] = useState(goals);

  const handleSave = async () => {
    await onSave({
      language,
      userId,
      fieldsToUpdate: { macroGoals: editedGoals },
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAwareScrollView
        contentContainerClassName="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-white p-6 pb-8 dark:bg-blackEerie">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="flex-1 font-bold-poppins text-lg text-gray-800">
                {translate('components.GoalsModal.heading')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditedGoals(goals);
                  onClose();
                }}
                className="p-2"
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* <ScrollView contentContainerClassName="pb-[200]"> */}
            <View className="mb-4">
              <Text className="mb-2 font-medium-poppins text-sm text-gray-700">
                {translate('components.GoalsModal.dailyCalories')}
              </Text>
              <TextInput
                maxLength={6}
                className="rounded-xl border border-gray-200 p-4 text-base text-red-200 dark:border-gray-600 dark:bg-black dark:text-white"
                keyboardType="number-pad"
                value={String(editedGoals.calories)}
                onChangeText={(text) =>
                  setEditedGoals({
                    ...editedGoals,
                    calories: Number(text) || 0,
                  })
                }
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 font-medium-poppins text-sm text-gray-700">
                {translate('components.TodayMacroOverview.protein')} (g)
              </Text>
              <TextInput
                maxLength={6}
                className="rounded-xl border border-gray-600 bg-gray-50 p-4 text-base dark:border-gray-600 dark:bg-black dark:text-white"
                keyboardType="number-pad"
                value={String(editedGoals.protein)}
                onChangeText={(text) =>
                  setEditedGoals({ ...editedGoals, protein: Number(text) || 0 })
                }
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 font-medium-poppins text-sm text-gray-700 dark:text-white">
                {translate('components.TodayMacroOverview.carbs')} (g)
              </Text>
              <TextInput
                maxLength={6}
                className="rounded-xl border border-gray-600 bg-gray-50 p-4 text-base dark:border-gray-600 dark:bg-black dark:text-white"
                keyboardType="number-pad"
                value={String(editedGoals.carbs)}
                onChangeText={(text) =>
                  setEditedGoals({ ...editedGoals, carbs: Number(text) || 0 })
                }
              />
            </View>

            <View className="mb-6">
              <Text className="mb-2 font-medium-poppins text-sm text-gray-700">
                {translate('components.TodayMacroOverview.fat')} (g)
              </Text>
              <TextInput
                maxLength={6}
                className="rounded-xl border border-gray-600  bg-gray-50 p-4 text-base dark:border-gray-600 dark:bg-black dark:text-white"
                keyboardType="number-pad"
                value={String(editedGoals.fat)}
                onChangeText={(text) =>
                  setEditedGoals({ ...editedGoals, fat: Number(text) || 0 })
                }
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="rounded-xl bg-blue-600 p-4"
              activeOpacity={0.8}
            >
              <Text className="text-center font-semibold-poppins text-base text-white">
                {translate('components.GoalsModal.saveGoals')}
              </Text>
            </TouchableOpacity>
            {/* </ScrollView> */}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Modal>
  );
};

const MacroOverviewScreen = () => {
  const {
    segmentedDays,
    currentMonth,
    currentYear,
    initialDayFocused,
    currentMonthNumber,
    startOfWeek,
    endOfWeek,
    changeWeekOffset,
    weekOffset,
    weekNumber,
    interval,
  } = useWeekNavigation();
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const goals = userInfo?.macroGoals;

  const { mutate: onDeleteMacroEntry } = useDeleteMacroEntry({
    startDate: startOfWeek,
    endDate: endOfWeek,
  });

  const { data: { data } = {}, isPending: isLoading } = useGetMacrosDateRange({
    startDate: startOfWeek,
    endDate: endOfWeek,
  });

  const goToPreviousWeek = () => {
    changeWeekOffset('left');
  };

  const goToNextWeek = () => {
    changeWeekOffset('right');
  };

  const handleDeleteMeal = ({ mealId, date }) => {
    Alert.alert(
      translate('components.TodayMacroOverview.deleteMeal'),
      translate('components.TodayMacroOverview.deleteMealConfirm'),
      [
        { text: translate('general.cancel'), style: 'cancel' },
        {
          text: translate('general.delete'),
          style: 'destructive',
          onPress: () => onDeleteMacroEntry({ mealId, date }),
        },
      ]
    );
  };

  const isCurrentWeek = weekOffset === 0;
  // if (!data) return;
  return (
    <ScreenWrapper>
      <ScreenHeader
        title={translate('components.TodayMacroOverview.macroJournal')}
      />
      {/* Header */}
      <View className="bg-white px-4 shadow-sm dark:bg-transparent">
        {/* Week Navigator */}
        <View className="mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToPreviousWeek}
            className="rounded-lg p-2"
          >
            <ChevronLeftRounded />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="font-semibold-poppins text-base text-gray-800 dark:text-white">
              {interval}
            </Text>
            <Text className="mt-1 font-medium-poppins text-base text-gray-200">{`${translate('components.WeekBlock.week')} ${weekNumber} - ${currentMonth} ${currentYear}`}</Text>
          </View>

          <TouchableOpacity
            onPress={goToNextWeek}
            className={`rounded-lg p-2 ${isCurrentWeek ? 'opacity-0' : ''}`}
            disabled={isCurrentWeek}
          >
            <ChevronRightRounded />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days List */}
      <ScrollView className="flex-1 p-4">
        {isLoading ? (
          <View className="py-20">
            <Text className="text-center text-gray-400">
              {translate('general.loading')}
            </Text>
          </View>
        ) : data && data.length > 0 ? (
          data.map((dayData) => (
            <DayCard
              key={dayData.date}
              dayData={dayData}
              goals={goals}
              onDeleteMeal={handleDeleteMeal}
            />
          ))
        ) : (
          <View className="py-20">
            <Text className="text-center text-gray-400">
              {translate('components.TodayMacroOverview.noActivityRecorded')}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default MacroOverviewScreen;
