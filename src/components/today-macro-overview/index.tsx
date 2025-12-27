/* eslint-disable max-lines-per-function */
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { translate } from '@/core';

import { colors, Text } from '../ui';
import { ChevronLeftIcon } from '../ui/assets/icons';
import ScanIcon from '../ui/assets/icons/scan';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MacroCircle = ({ value, goal, color, label, delay = 0 }) => {
  const percentage = Math.min((value / goal) * 100, 100);
  const circumference = 2 * Math.PI * 22;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      delay: delay + 200,
      useNativeDriver: true,
    }).start();
  }, [percentage, animatedValue, delay]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <Animated.View
      className="flex-1 items-center"
      style={{
        transform: [{ scale: scaleValue }],
        opacity: opacityValue,
      }}
    >
      <View className="relative mb-1.5" style={{ width: 58, height: 58 }}>
        <Svg width="58" height="58" viewBox="0 0 52 52">
          <Circle
            cx="26"
            cy="26"
            r="22"
            stroke={colors.charcoal[700] || '#F3F4F6'}
            strokeWidth="5"
            fill="none"
          />
          <AnimatedCircle
            cx="26"
            cy="26"
            r="22"
            stroke={color}
            strokeWidth="5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="26, 26"
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text className="font-bold-poppins text-sm text-gray-800">
            {value}g
          </Text>
        </View>
      </View>
      <Text className="text-center font-medium-poppins text-sm text-gray-700">
        {label}
      </Text>
      {/* <Text className="text-[10px] text-gray-400">{goal}g goal</Text> */}
    </Animated.View>
  );
};

export const TodayMacroView = ({
  data = { calories: 0, carbs: 0, fat: 0, protein: 0 },
  goals,
  onPress,
  onEditGoals,
}) => {
  const caloriePercentage = Math.min(
    (data.calories / goals.calories) * 100,
    100
  );

  const circumference = 2 * Math.PI * 48;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main circle entrance animation
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    Animated.spring(animatedValue, {
      toValue: caloriePercentage,
      tension: 40,
      friction: 8,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [caloriePercentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        className="mx-4 my-2 rounded-2xl bg-white p-3.5 shadow-sm dark:bg-black"
        activeOpacity={0.7}
      >
        <View className="mb-2.5 flex-row flex-wrap items-center justify-between gap-2">
          <View className="flex-row items-center gap-1">
            <Text className="font-bold-poppins text-lg">
              {translate('components.TodayMacroOverview.heading')}
            </Text>
            <ChevronLeftIcon
              width={24}
              height={24}
              transform="rotate(180)"
              color={colors.primary[400]}
            />
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-2"
            onPress={() => router.navigate('/scan')}
          >
            <Text className="font-semibold-poppins text-lg text-gray-500 dark:text-primary-300">
              {translate('components.TodayMacroOverview.scanFood')}
            </Text>
            <ScanIcon color={colors.primary[300]} />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between">
          <Animated.View
            className="mb-3 items-center justify-center"
            style={{
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }}
          >
            <View className="relative" style={{ width: 100, height: 100 }}>
              <Svg width="100" height="100" viewBox="0 0 110 110">
                <Circle
                  cx="55"
                  cy="55"
                  r="48"
                  stroke={colors.charcoal[800] || '#F3F4F6'}
                  strokeWidth="10"
                  fill="none"
                />
                <AnimatedCircle
                  cx="55"
                  cy="55"
                  r="48"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="55, 55"
                />
              </Svg>
              <View className="absolute inset-0 items-center justify-center">
                <Text className="font-bold-poppins text-2xl text-gray-800">
                  {data.calories}
                </Text>
                <Text className="text-sm text-gray-500">
                  / {goals.calories}
                </Text>
                {/* <Text className="text-[10px] text-gray-400">cal</Text> */}
              </View>
            </View>
            <Text className="w-[65%] text-center text-sm">
              {translate('components.TodayMacroOverview.calories')}
            </Text>
          </Animated.View>

          <View className="flex-1 flex-row items-center justify-center pt-2.5">
            <MacroCircle
              value={data.protein}
              goal={goals.protein}
              color="#3B82F6"
              label={translate('components.TodayMacroOverview.protein')}
              delay={400}
            />
            <MacroCircle
              value={data.carbs}
              goal={goals.carbs}
              color="#F59E0B"
              label={translate('components.TodayMacroOverview.carbs')}
              delay={500}
            />
            <MacroCircle
              value={data.fat}
              goal={goals.fat}
              color="#EF4444"
              label={translate('components.TodayMacroOverview.fat')}
              delay={600}
            />
          </View>
        </View>
        {/* Daily Goals Section */}
        <TouchableOpacity onPress={onEditGoals} activeOpacity={0.7}>
          <View className="mt-2 overflow-hidden rounded-xl border-2 dark:from-blue-900/20 dark:to-purple-900/20">
            <View className="mb-2 flex-row items-center gap-2">
              <Text className="font-semibold-poppins text-sm uppercase text-gray-600 dark:text-white">
                {translate('components.TodayMacroOverview.dailyIntakeGoals')}
              </Text>
              <TouchableOpacity
                onPress={onEditGoals}
                className="rounded-lg bg-white/80 px-2.5 py-1 dark:bg-gray-800/80"
                activeOpacity={0.7}
              >
                <Text className="font-medium-poppins text-sm text-blue-600 dark:text-blue-200">
                  {translate('general.change')}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-base font-bold text-gray-800 dark:text-white">
                  {goals.calories}
                </Text>
                <Text className="text-[10px] text-gray-600 dark:text-gray-400">
                  {translate('components.TodayMacroOverview.calories')}
                </Text>
              </View>
              <View className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <View className="items-center">
                <Text className="text-base font-bold text-blue-600">
                  {goals.protein}g
                </Text>
                <Text className="text-[10px] text-gray-600 dark:text-gray-400">
                  {translate('components.TodayMacroOverview.protein')}
                </Text>
              </View>
              <View className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <View className="items-center">
                <Text className="text-base font-bold text-amber-600">
                  {goals.carbs}g
                </Text>
                <Text className="text-[10px] text-gray-600 dark:text-gray-400">
                  {translate('components.TodayMacroOverview.carbs')}
                </Text>
              </View>
              <View className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <View className="items-center">
                <Text className="text-base font-bold text-red-600">
                  {goals.fat}g
                </Text>
                <Text className="text-[10px] text-gray-600 dark:text-gray-400">
                  {translate('components.TodayMacroOverview.fat')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </>
  );
};
