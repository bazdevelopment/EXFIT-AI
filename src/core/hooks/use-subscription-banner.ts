import { useGetCustomerInfo } from '@/api/subscription/subscription.hooks';
import { useUser } from '@/api/user/user.hooks';

import { useSelectedLanguage } from '../i18n';
import { calculateFreeTrialDays } from '../utilities/calculate-free-trial-days';

const useSubscriptionAlert = () => {
  const { language } = useSelectedLanguage();
  const { data: customerInfo } = useGetCustomerInfo();
  const { data: userInfo } = useUser(language);
  const daysLeft = calculateFreeTrialDays({
    endDateISO: userInfo.trial.endDateISO,
  });
  const hasActiveSubscription = !!customerInfo?.activeSubscriptions?.length;
  const isUpgradeRequired = !hasActiveSubscription && daysLeft <= 0;

  return {
    isUpgradeRequired,
  };
};

export default useSubscriptionAlert;
