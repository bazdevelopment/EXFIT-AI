import { firebaseCloudFunctionsInstance } from 'firebase/config';

import {
  type CalendarStatusMap,
  type ICreateLogRequestData,
  type ICreateLogResponseData,
  type IRequestCalendarActivity,
} from './activity-logs.types';

/** Crete activity log */
export const createActivityLog = async (
  logData: ICreateLogRequestData
): Promise<ICreateLogResponseData> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('createActivityLog')(
        logData
      );

    return data as ICreateLogResponseData;
  } catch (error) {
    throw error;
  }
};

/** Get calendar activity log */
export const getCalendarActivity = async (
  payload: IRequestCalendarActivity
): Promise<CalendarStatusMap> => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getCalendarActivityLog'
    )(payload);
    return data as CalendarStatusMap;
  } catch (error) {
    throw error;
  }
};
