import React from 'react';
import { View } from 'react-native';

import type { TxKeyPath } from '@/core';

import { Text } from '../ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export const ItemsContainer = ({ children, title }: Props) => {
  return (
    <View className="my-4 flex-1">
      {title && (
        <Text
          className="mb-2 font-semibold-poppins text-lg text-white"
          tx={title}
        />
      )}
      <View className="gap-3">{children}</View>
    </View>
  );
};
