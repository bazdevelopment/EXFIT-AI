import { firebaseCloudFunctionsInstance } from 'firebase/config';

export const fetchProgressAnalytics = async (): Promise<any> => {
  try {
    const onFetchProgressAnalytics =
      firebaseCloudFunctionsInstance.httpsCallable('getProgressAnalytics');
    const { data } = await onFetchProgressAnalytics();
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
