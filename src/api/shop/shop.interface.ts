export interface IShopItem {
  id: string;
  name: string;
  costInGems: number;
  category: string;
  type: 'consumable' | 'permanent_unlock';
  description: string;
  isDisabled: boolean;
  imageUrl: string;
}
export interface IOwnShopItem extends IShopItem {
  quantity: number;
}
export interface IOwnedPurchaseItems {
  items: IOwnShopItem[];
}

export interface IShopItems {
  items: IShopItem[];
}

export interface IPurchaseShopItemResponse {
  message: string;
  success: boolean;
}
