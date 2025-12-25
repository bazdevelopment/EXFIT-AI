import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import { ScrollView, View } from 'react-native';

import { useShopItems } from '@/api/shop/shop.hooks';
import { useUser } from '@/api/user/user.hooks';
import { PurchaseItemModal } from '@/components/modals/purchase-item-modal';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import SkeletonLoader from '@/components/skeleton-loader';
import { Image, Text, useModal } from '@/components/ui';
import { DEVICE_DIMENSIONS } from '@/constants/device-dimensions';
import { translate, useSelectedLanguage } from '@/core';

// mockData/shopData.ts

export interface GemOffer {
  id: string;
  amount: number;
  price: number;
  icon: string;
  popular?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  costInGems: number;
  category: string;
  imageUrl: string;
  type: string;
  description: string;
  isDisabled: boolean;
}

interface GemOfferCardProps {
  offer: GemOffer;
  onPress: (offer: GemOffer) => void;
}

export const GemOfferCard: React.FC<GemOfferCardProps> = ({
  offer,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(offer)}
      className="items-center justify-between rounded-2xl border border-gray-700 bg-[#191A21] p-4 dark:bg-[#191A21]"
    >
      <View className="flex-1 items-center justify-center">
        <Image source={offer.icon} className="size-[72]" />
        <Text className="font-medium-poppins text-sm text-white">
          {offer.amount} Gems
        </Text>
      </View>
      <View className="mt-2 w-full rounded-full bg-blue-600 px-2 py-1.5">
        <Text className="text-center font-semibold-poppins text-white">
          ${offer.price.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface ShopItemCardProps {
  item: ShopItem;
  onPress: (item: ShopItem) => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  onPress,
}) => {
  if (item.isDisabled) {
    // --- Disabled State ---
    // This renders a simplified, clear "unavailable" card.
    // It avoids duplicating and dimming the regular content, reducing visual noise.
    return (
      <View
        className="h-[174] items-center justify-center rounded-2xl border border-gray-600 bg-gray-800/50 p-4"
        // Accessibility hint for screen readers
        accessibilityLabel={`${item.name}, Unavailable`}
      >
        <View className="flex-1 items-center justify-center grayscale">
          <Image
            source={{ uri: item.imageUrl }}
            className="size-[72] opacity-30"
          />
        </View>

        <View className="my-2 items-center">
          <Text className="text-center font-medium-poppins text-sm leading-tight text-gray-400">
            {item.name}
          </Text>
        </View>

        <View className="items-center rounded-full bg-gray-700 px-2 py-1.5 shadow-md">
          <Text className="font-primary-poppins text-xs text-red-400">
            {translate('components.ShopItemCard.unavailable')}
          </Text>
          {item.unavailableReason && (
            <Text className="font-regular-poppins mt-0.5 text-[10px] text-gray-300">
              {item.unavailableReason}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // --- Active State ---
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="h-[174] items-center justify-between rounded-2xl border border-blue-500 bg-[#191A21] p-4 transition-all duration-200 active:scale-95 dark:bg-[#191A21]"
      accessibilityLabel={`${item.name}, ${translate('components.ShopItemCard.worth')} ${item.costInGems} gems`}
    >
      {/* Main Content */}
      <View className="flex-1 items-center justify-center">
        <Image source={{ uri: item.imageUrl }} className="size-[72]" />
        <Text className="mt-2 text-center font-medium-poppins text-sm leading-tight text-white">
          {item.name}
        </Text>
      </View>

      {/* Price Tag */}
      <View className="mt-2 w-full flex-row items-center justify-center rounded-full bg-gray-700 px-3 py-1">
        {item.quantity ? (
          <>
            <Text className="mr-1 text-lg text-blue-400">🔒</Text>

            <Text className="font-semibold-poppins text-xs text-white">
              {item.quantity} {translate('components.ShopItemCard.equiped')}
            </Text>
          </>
        ) : (
          <>
            <Text className="mr-1 text-lg text-blue-400">💎</Text>
            <Text className="font-semibold-poppins text-sm text-white">
              {item.costInGems}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};
interface ShopHeaderProps {
  onBackPress: () => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ onBackPress }) => {
  return (
    <View className="flex-row items-center justify-between bg-gray-900 px-6 py-4">
      <TouchableOpacity onPress={onBackPress} className="p-2">
        <Text className="text-xl text-white">←</Text>
      </TouchableOpacity>
      <Text className="font-semibold-poppins text-xl text-white">
        {translate('components.ShopItemCard.shop')}
      </Text>
      <TouchableOpacity className="p-2">
        <Text className="text-xl text-white">🛒</Text>
      </TouchableOpacity>
    </View>
  );
};

export const RewardBanner: React.FC = () => {
  return (
    <View className="mx-6 mt-6 overflow-hidden rounded-2xl">
      <LinearGradient
        colors={['#5458F9', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 14 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-bold-poppins text-lg text-white">
              {translate('components.ShopItemCard.earnedId')}
            </Text>
            <Text className="font-bold-poppins text-lg text-white">
              {translate('components.ShopItemCard.treat')}
            </Text>
            <Text className="mt-1 text-sm text-white opacity-90">
              {translate('components.ShopItemCard.spendGems')}
            </Text>
          </View>
          <Image
            source={require('../components/ui/assets/images/shop/trofee.png')}
            className="size-[92]"
          />
        </View>
      </LinearGradient>
    </View>
  );
};

export const gemOffers: GemOffer[] = [
  {
    id: '1',
    amount: 100,
    price: 0.99,
    icon: require('../components/ui/assets/images/shop/basic-gem.png'),
  },
  {
    id: '2',
    amount: 500,
    price: 3.99,
    icon: require('../components/ui/assets/images/shop/gem-bag.png'),
  },
  {
    id: '3',
    amount: 1200,
    price: 7.99,
    icon: require('../components/ui/assets/images/shop/gem-trunk.png'),
  },
];

const ShopScreen = () => {
  const { data: shopData, isLoading } = useShopItems();
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);
  const purchaseItemModal = useModal();
  const { displayProductName } = useLocalSearchParams();

  const screenWidth = DEVICE_DIMENSIONS.DEVICE_WIDTH;
  // Calculate items per row based on screen width
  const itemsPerRow = useMemo(() => {
    if (screenWidth < 350) return 1; // Very small phones
    if (screenWidth < 400) return 2; // Small phones
    return 3; // Normal phones and larger
  }, [screenWidth]);

  // Calculate item width with proper spacing
  const itemWidth = useMemo(() => {
    const padding = 20; // Assuming 16px padding on each side
    const gaps = (itemsPerRow - 1) * 1; // 8px gap between items
    const availableWidth = screenWidth - padding - gaps;
    return `${(availableWidth / itemsPerRow / screenWidth) * 100}%`;
  }, [screenWidth, itemsPerRow]);

  const shopItems = shopData?.items;

  useEffect(() => {
    if (displayProductName && !!shopItems?.length) {
      const foundProduct = shopItems.find(
        (potion) => potion.id === displayProductName
      );
      if (foundProduct) {
        purchaseItemModal.present(foundProduct);
      }
    }
  }, [displayProductName, purchaseItemModal, shopItems]);

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={translate('components.ShopItemCard.shop')}
          // rightComponent={
          //   <Icon
          //     icon={<ShoppingCart />}
          //     iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
          //     size={20}
          //     color={colors.white}
          //     onPress={() => router.navigate('/shopping-cart')}
          //   />
          // }
        />

        <RewardBanner />

        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <View className="mt-8 px-6 pb-8">
            <Text className="mb-2 font-semibold-poppins text-xl text-white">
              Streak
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {shopItems?.map((item, index) => (
                <View
                  key={item.id}
                  className="mb-4"
                  style={{
                    width: itemWidth,
                  }}
                >
                  <ShopItemCard
                    item={item}
                    onPress={purchaseItemModal.present}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <PurchaseItemModal
        onCloseModal={purchaseItemModal.dismiss}
        currentGemBalance={userInfo.gamification.gemsBalance}
        ref={purchaseItemModal.ref}
      />
    </ScreenWrapper>
  );
};

export default ShopScreen;
