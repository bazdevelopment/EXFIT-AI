import { firebaseCloudFunctionsInstance } from 'firebase/config';

import {
  type IOwnedPurchaseItems,
  type IPurchaseShopItemResponse,
  type IShopItems,
} from './shop.interface';

export const seedShopItems = async () => {
  try {
    const handleSeedShopItems =
      firebaseCloudFunctionsInstance.httpsCallable('seedShopItems');
    const { data } = await handleSeedShopItems();

    return data;
  } catch (error) {
    throw error;
  }
};

export const getShopItems = async (): Promise<IShopItems> => {
  try {
    const handleGetShopItems =
      firebaseCloudFunctionsInstance.httpsCallable('getShopItems');
    const { data } = await handleGetShopItems();
    return data as IShopItems;
  } catch (error) {
    throw error;
  }
};

export const fetchOwnedPurchasedItems =
  async (): Promise<IOwnedPurchaseItems> => {
    try {
      const handleFetchOwnedItems =
        firebaseCloudFunctionsInstance.httpsCallable('getOwnPurchasedItems');
      const { data } = await handleFetchOwnedItems();
      return data as IOwnedPurchaseItems;
    } catch (error) {
      throw error;
    }
  };

export const purchaseShopItem = async ({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}): Promise<IPurchaseShopItemResponse> => {
  try {
    const handlePurchaseShopItem =
      firebaseCloudFunctionsInstance.httpsCallable('purchaseShopItem');
    const { data } = await handlePurchaseShopItem({
      itemId,
      quantity,
    });
    return data as IPurchaseShopItemResponse;
  } catch (error) {
    throw error;
  }
};

export const onStreakRepair = async () => {
  try {
    const handleStreakRepair =
      firebaseCloudFunctionsInstance.httpsCallable('repairStreak');
    const { data } = await handleStreakRepair();
    return data;
  } catch (error) {
    throw error;
  }
};
