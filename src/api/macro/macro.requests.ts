// Functions with proper types

import { firebaseCloudFunctionsInstance } from 'firebase/config';

import {
  type DailyMacroLogResponse,
  type ICreateMacroRequestData,
  type ICreateMacroResponseData,
  type IDeleteMacroEntry,
  type IGetDailyMacrosByDateRange,
  type IRequestDailyMacrosByDate,
} from './macro.types';

/** Create macro entry */
export const createMacroEntryRequest = async (
  logData: ICreateMacroRequestData
): Promise<ICreateMacroResponseData> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('addMacroEntry')(
        logData
      );

    return data as ICreateMacroResponseData;
  } catch (error) {
    throw error;
  }
};

/** Get daily macros */
export const getDailyMacrosRequest = async (
  payload: IRequestDailyMacrosByDate
): Promise<DailyMacroLogResponse> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('getDailyMacros')(
        payload
      );
    return data as DailyMacroLogResponse;
  } catch (error) {
    throw error;
  }
};

/** Get daily macros */
export const getMacrosPerDateRange = async (
  payload: IGetDailyMacrosByDateRange
): Promise<any> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('getMacroDateRange')(
        payload
      );
    return data as any;
  } catch (error) {
    throw error;
  }
};

/** Delete macro entry meal */
export const deleteMacroEntry = async (
  payload: IDeleteMacroEntry
): Promise<any> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('deleteMacroEntry')(
        payload
      );
    return data as any;
  } catch (error) {
    throw error;
  }
};
