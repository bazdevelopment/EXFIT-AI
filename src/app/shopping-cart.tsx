import { router } from 'expo-router';
import React from 'react';

import { useOwnedPurchasedItems } from '@/api/shop/shop.hooks';
import EdgeCaseTemplate from '@/components/edge-case-template';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import { ShoppingPurchasedCard } from '@/components/shopping-purchased-card';
import SkeletonLoader from '@/components/skeleton-loader';
import { Button, colors, Text, View } from '@/components/ui';
import { ArrowRight, ShopBasket } from '@/components/ui/assets/icons';
import { ShoppingCartEmpty } from '@/components/ui/assets/illustrations/shopping-cart-empty';
import { translate } from '@/core';

const ShoppingCart = () => {
  const { data: ownPurchasedData, isLoading } = useOwnedPurchasedItems();

  return (
    <ScreenWrapper>
      <ScreenHeader
        title={translate('rootLayout.screens.shoppingCart.heading')}
      />

      {isLoading ? (
        <SkeletonLoader />
      ) : ownPurchasedData?.items?.length ? (
        <View className="mt-4 px-6">
          <Text className="font-semibold-poppins text-xl text-white">
            Streak
          </Text>
          <View className="mt-4 gap-2">
            {ownPurchasedData?.items?.map((item) => (
              <ShoppingPurchasedCard record={item} key={item.id} />
            ))}
            <Button
              label={translate('rootLayout.screens.shoppingCart.equipMore')}
              icon={<ShopBasket color={colors.white} width={20} height={20} />}
              loading={false}
              className="mt-8 h-14 w-[90%] justify-center self-center rounded-full bg-[#4E52FB] active:opacity-85 dark:bg-[#4E52FB]"
              textClassName="text-white text-center text-base font-medium-poppins dark:text-white"
              onPress={() => router.navigate('/shop')}
            />
          </View>
        </View>
      ) : (
        <EdgeCaseTemplate
          image={<ShoppingCartEmpty />}
          title={translate('rootLayout.screens.shoppingCart.noItems')}
          message={translate('rootLayout.screens.shoppingCart.buyPotions')}
          additionalClassName="px-16 -top-[15%]"
          primaryAction={{
            label: translate('rootLayout.screens.shoppingCart.goToShop'),
            onPress: () => router.navigate('/shop'),
            variant: 'default',
            icon: <ArrowRight color={colors.black} width={18} height={18} />,
          }}
        />
      )}
    </ScreenWrapper>
  );
};

export default ShoppingCart;
