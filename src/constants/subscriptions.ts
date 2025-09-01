import { Platform } from 'react-native';

export const SUBSCRIPTIONS_PLANS_ANDROID = {
  YEARLY: 'exfit_ai_1year_subscription:yearly-subscription',
  WEEKLY: 'exfit_ai_1week_subscription:weekly-subscription',
};

export const SUBSCRIPTIONS_PLANS_IOS = {
  YEARLY: 'exfit_ai_1year_subscription',
  WEEKLY: 'exfit_ai_1week_subscription',
};

export const SUBSCRIPTION_PLANS_PER_PLATFORM = Platform.select({
  android: {
    YEARLY: SUBSCRIPTIONS_PLANS_ANDROID.YEARLY,
    WEEKLY: SUBSCRIPTIONS_PLANS_ANDROID.WEEKLY,
  },
  ios: {
    YEARLY: SUBSCRIPTIONS_PLANS_IOS.YEARLY,
    WEEKLY: SUBSCRIPTIONS_PLANS_IOS.WEEKLY,
  },
});
