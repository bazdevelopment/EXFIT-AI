import * as React from 'react';
import { Pressable, View } from 'react-native';

import type { TxKeyPath } from '@/core';

import { colors, Text } from '../ui';
import { ArrowRight } from '../ui/assets/icons';

type ItemProps = {
  text: TxKeyPath;
  value?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
};

export const Item = ({ text, value, icon, onPress }: ItemProps) => {
  const isPressable = onPress !== undefined;
  return (
    <Pressable
      onPress={onPress}
      pointerEvents={isPressable ? 'auto' : 'none'}
      className="flex-1 flex-row items-center justify-between rounded-xl bg-white/10 p-4 active:opacity-80 dark:bg-white/10"
    >
      <View className="ml-1 flex-row items-center">
        {icon && <View className="pr-2">{icon}</View>}
        <Text
          tx={text}
          className="font-medium-poppins text-base text-white dark:text-white"
        />
      </View>
      <View className="flex-row items-center">
        <Text className="text-base text-white dark:text-white">{value}</Text>
        {isPressable && (
          <View className="pl-2">
            <ArrowRight color={colors.charcoal[300]} />
          </View>
        )}
      </View>
    </Pressable>
  );
};
