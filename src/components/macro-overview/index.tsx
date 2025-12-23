import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { useCreateMacroEntry } from '@/api/macro/macro.hooks';
import { useSelectedLanguage } from '@/core';
import { getCurrentDay } from '@/core/utilities/date-time-helpers';

import { Text } from '../ui';
import CircleCheck from '../ui/assets/icons/circle-check';
import Fire from '../ui/assets/icons/fire';
import Plus from '../ui/assets/icons/plus';

interface Props {
  metadata: AIActionMetadata;
  onLog: (data: any) => void;
}

export const MacroOverview: React.FC<Props> = ({ metadata }) => {
  const [isLogged, setIsLogged] = useState(false);
  const { language } = useSelectedLanguage();
  const { mutate: logMacroEntry } = useCreateMacroEntry();
  const currentActiveDay = getCurrentDay('YYYY-MM-DD', language);

  const handlePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLogged(true);
    logMacroEntry({ ...metadata.data, type: 'food', date: currentActiveDay });
  };

  if (metadata.type === 'food') {
    const food = metadata.data as FoodData;
    return (
      <View className="my-2 flex-1 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <View className="mb-3 flex-1 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
              <Fire width={20} height={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Analysis
              </Text>
              <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {food.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Macro Grid */}
        <View className="mb-4 flex-row justify-between rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <MacroItem
            label="Calories"
            value={food.calories + ' Kcal'}
            color="text-orange-600 dark:text-orange-400"
          />
          <View className="h-full w-px bg-slate-100 dark:bg-slate-700" />

          <MacroItem
            label="Protein"
            value={`${food.protein}g`}
            color="text-blue-600 dark:text-blue-400"
          />
          <View className="h-full w-px bg-slate-100 dark:bg-slate-700" />
          <MacroItem
            label="Carbs"
            value={`${food.carbs}g`}
            color="text-green-600 dark:text-green-400"
          />
          <View className="h-full w-px bg-slate-100 dark:bg-slate-700" />
          <MacroItem
            label="Fat"
            value={`${food.fat}g`}
            color="text-purple-600 dark:text-purple-400"
          />
        </View>

        <TouchableOpacity
          disabled={isLogged}
          onPress={handlePress}
          className={`flex-row items-center justify-center rounded-2xl py-3 ${
            isLogged
              ? 'bg-green-500 dark:bg-green-600'
              : 'bg-slate-900 dark:bg-orange-500'
          }`}
        >
          {isLogged ? (
            <CircleCheck width={20} height={20} color="white" />
          ) : (
            <Plus width={20} height={20} color="white" />
          )}
          <Text className="ml-2 font-semibold text-white">
            {isLogged ? 'Added to Log' : 'Count for today'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const MacroItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View className="flex-1 items-center">
    <Text className="mb-1 text-[10px] font-bold uppercase text-slate-400">
      {label}
    </Text>
    <Text className={`font-bold ${color}`}>{value}</Text>
  </View>
);

export interface FoodData {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ExerciseData {
  label: string;
  muscles: string[];
  form_score: string;
}

export interface AIActionMetadata {
  type: 'food' | 'exercise';
  data: FoodData | ExerciseData;
}
