import { type CustomerInfo } from 'react-native-purchases';

import { type IUserInfo } from '@/types/general-types';

export const updateUserAfterSelectingPlan = async ({
  language,
  userId,
  collectedData,
  customerInfo,
  onUpdateUser,
}: {
  language: string;
  userId: string;
  collectedData: { preferredName: string };
  customerInfo: CustomerInfo;
  onUpdateUser: ({
    language,
    userId,
    fieldsToUpdate,
  }: {
    language: string;
    userId: string;
    fieldsToUpdate: object;
  }) => Promise<void>;
}) => {
  const fieldsToUpdate: Partial<IUserInfo> = {
    isFreeTrialOngoing: !!customerInfo?.activeSubscriptions?.length
      ? false
      : true,
    ...(customerInfo && {
      activeSubscriptionsRevenue: customerInfo.activeSubscriptions,
      allExpirationDatesRevenue: customerInfo.allExpirationDates,
      allPurchaseDatesRevenue: customerInfo.allPurchaseDates,
      allPurchasedProductIdentifiersRevenue:
        customerInfo.allPurchasedProductIdentifiers,
      firstSeenRevenue: customerInfo.firstSeen,
    }),
  };

  // Guard clause to ensure onUpdateUser is a function
  // If onUpdateUser is undefined, return a resolved Promise
  if (typeof onUpdateUser !== 'function') {
    console.error('onUpdateUser is not a function');
    return Promise.resolve(); // Resolved Promise to ensure .then() is called
  }

  // Otherwise, call onUpdateUser and return its Promise
  return onUpdateUser({
    language,
    userId,
    fieldsToUpdate,
  });
};
