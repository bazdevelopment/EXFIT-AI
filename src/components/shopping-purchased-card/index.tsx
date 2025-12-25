import { View } from 'react-native';

import { translate } from '@/core';

import { colors, Image, Text } from '../ui';
import { CheckIcon } from '../ui/assets/icons';

export const ShoppingPurchasedCard = ({ record }) => {
  return (
    <View className="overflow-hidden rounded-2xl  border-2 border-white/20 p-4">
      <View className="flex-row items-center">
        {/* Icon */}
        <View className="mr-4">
          <Image source={{ uri: record.imageUrl }} className="size-16" />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="mb-1 font-bold-poppins text-lg text-white">
            {record.name}
          </Text>

          <Text className="mb-2 text-base text-white opacity-90 dark:text-white">
            {translate('components.ShoppingPurchasedCard.heading')}
          </Text>

          {/* Status Badge */}
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-2 self-start rounded-md bg-white/20 px-3">
              <Text className="g font-medium-poppins text-white dark:text-white">
                {record.quantity}
              </Text>
              <Text className="font-semibold-poppins text-sm text-white dark:text-white">
                {translate('components.ShoppingPurchasedCard.owned')}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 self-start rounded-md bg-[#4E52FB] px-3 dark:bg-[#4E52FB]">
              <CheckIcon width={20} height={20} color={colors.white} />
              <Text className="font-semibold-poppins text-sm text-white dark:text-white">
                {record.id === 'STREAK_REVIVAL_ELIXIR'
                  ? translate('components.ShoppingPurchasedCard.manualTrigger')
                  : translate('components.ShoppingPurchasedCard.activated')}
              </Text>
            </View>
            {/* <SelectableChip
              title="Active"
              isSelected={true}
              className="bg-[#3195FD] py-[2.5px] dark:bg-[#3195FD]"
              textClassName="text-white"
              icon={<CheckIcon width={14} height={14} color="white" />}
              onPress={() => {}}
            /> */}
          </View>
        </View>
      </View>
    </View>
  );
};
