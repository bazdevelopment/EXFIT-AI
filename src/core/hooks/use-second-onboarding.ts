import { useMMKVBoolean } from 'react-native-mmkv';

import { storage } from '../storage';

const IS_SECOND_ONBOARDING_DONE = 'IS_SECOND_ONBOARDING_DONE';

export const useSecondOnboarding = () => {
  const [isSecondOnboardingDone, setIsSecondOnboardingDone] = useMMKVBoolean(
    IS_SECOND_ONBOARDING_DONE,
    storage
  );
  if (isSecondOnboardingDone === undefined) {
    return [false, setIsSecondOnboardingDone] as const;
  }
  return [isSecondOnboardingDone, setIsSecondOnboardingDone] as const;
};
