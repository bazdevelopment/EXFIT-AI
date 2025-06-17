import { useMMKVBoolean } from 'react-native-mmkv';

import { storage } from '../storage';

const IS_FIRST_ONBOARDING_DONE = 'IS_FIRST_ONBOARDING_DONE';

export const useFirstOnboarding = () => {
  const [isFirstOnboardingDone, setIsFirstOnboardingDone] = useMMKVBoolean(
    IS_FIRST_ONBOARDING_DONE,
    storage
  );
  if (isFirstOnboardingDone === undefined) {
    return [false, setIsFirstOnboardingDone] as const;
  }
  return [isFirstOnboardingDone, setIsFirstOnboardingDone] as const;
};
