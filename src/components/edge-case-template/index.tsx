import React from 'react';
import { View } from 'react-native';

import { DEVICE_DIMENSIONS } from '@/constants/device-dimensions';

import { Button, Text } from '../ui';
import { type IEdgeCaseTemplate } from './edge-case-template.interface';

const EdgeCaseTemplate = ({
  image,
  title,
  message,
  primaryAction,
  secondaryAction,
  additionalClassName = '',
}: IEdgeCaseTemplate) => {
  return (
    <View
      className={`flex-1 items-center justify-center px-6 ${additionalClassName}`}
      style={{ width: DEVICE_DIMENSIONS.DEVICE_WIDTH }}
    >
      {image && <View>{image}</View>}
      <Text className="mb-2 text-center font-semibold-poppins text-xl text-white dark:text-white">
        {title}
      </Text>
      {!!message && (
        <Text className="mt-2 text-center font-medium-poppins text-base text-white dark:text-white">
          {message}
        </Text>
      )}

      <View className="mt-4 w-full flex-row items-center justify-center gap-4">
        {!!primaryAction && (
          <Button
            label={primaryAction.label}
            className="rounded-full bg-white active:opacity-85 dark:bg-white"
            textClassName="text-black font-medium-poppins"
            variant={primaryAction.variant}
            icon={primaryAction.icon}
            onPress={primaryAction.onPress}
          />
        )}
        {!!secondaryAction && (
          <Button
            label={secondaryAction.label}
            className="rounded-full"
            variant="default"
          />
        )}
      </View>
    </View>
  );
};

export default EdgeCaseTemplate;
