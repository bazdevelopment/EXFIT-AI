import { recordError } from '@react-native-firebase/crashlytics';
import { type AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';
import { translate } from '@/core';

import { queryClient } from '../common';
import {
  type IOwnedPurchaseItems,
  type IPurchaseShopItemResponse,
  type IShopItems,
} from './shop.interface';
import {
  fetchOwnedPurchasedItems,
  getShopItems,
  purchaseShopItem,
} from './shop.requests';

export const useShopItems = () =>
  createQuery<IShopItems, any, AxiosError>({
    queryKey: ['shop-items'],
    fetcher: getShopItems,
  })();

export const useOwnedPurchasedItems = () =>
  createQuery<IOwnedPurchaseItems, any, AxiosError>({
    queryKey: ['owned-purchased-shop-items'],
    fetcher: fetchOwnedPurchasedItems,
  })();

export const usePurchaseShopItem = () => {
  return createMutation<
    IPurchaseShopItemResponse,
    { itemId: string; quantity: number },
    AxiosError
  >({
    mutationFn: (variables) => purchaseShopItem(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['owned-purchased-shop-items'],
      });
    },
    onError: (error) => {
      Toast.error(
        error.message || translate('alerts.sendVerificationCodeError')
      );
      recordError(error, 'Sending verification failed');
    },
  })();
};
