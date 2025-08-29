import { useGetCustomerInfo } from '@/api/subscription/subscription.hooks';

const useSubscriptionAlert = () => {
  const { data: customerInfo } = useGetCustomerInfo();

  const hasActiveSubscription = !!customerInfo?.activeSubscriptions?.length;
  const isUpgradeRequired = !hasActiveSubscription;

  return {
    isUpgradeRequired,
  };
};

export default useSubscriptionAlert;
