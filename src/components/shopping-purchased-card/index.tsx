import { View } from 'react-native';

import { Image, Text } from '../ui';

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
            Protect your streak if you miss a day of practice.
          </Text>

          {/* Status Badge */}
          <View className="flex-row items-center gap-2 self-start rounded-md bg-white/20 px-3">
            <Text className="font-extra-bold-poppins text-lg text-white dark:text-white">
              {record.quantity}
            </Text>
            <Text className="font-semibold-poppins text-sm text-white dark:text-white">
              OWNED
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
