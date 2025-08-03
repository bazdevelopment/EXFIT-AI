import { firebaseCloudFunctionsInstance } from 'firebase/config';

export const startFreeTrial = async () => {
  try {
    const onStartFreeTrial =
      firebaseCloudFunctionsInstance.httpsCallable('startFreeTrial');
    const { data } = await onStartFreeTrial();

    return data;
  } catch (error) {
    throw error;
  }
};
