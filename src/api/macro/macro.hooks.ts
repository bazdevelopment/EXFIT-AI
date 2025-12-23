import { type AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';

import { queryClient } from '../common';
import {
  createMacroEntryRequest,
  deleteMacroEntry,
  getDailyMacrosRequest,
  getMacrosPerDateRange,
} from './macro.requests';
import {
  type DailyMacroLogResponse,
  type ICreateMacroRequestData,
  type ICreateMacroResponseData,
  type IDeleteMacroEntry,
  type IGetDailyMacrosByDateRange,
  type IRequestDailyMacrosByDate,
} from './macro.types';

export const useCreateMacroEntry = () =>
  createMutation<ICreateMacroResponseData, ICreateMacroRequestData, AxiosError>(
    {
      mutationFn: (variables) => createMacroEntryRequest(variables),
      onSuccess: (data) => {
        Toast.success('Macro entry created successfully');
        queryClient.invalidateQueries({ queryKey: ['daily-macros'] });
      },
      onError: () => {
        Toast.error('Error creating macro log');
      },
    }
  )();

export const useGetDailyMacros = ({ date }: { date: string }) =>
  createQuery<DailyMacroLogResponse, IRequestDailyMacrosByDate, AxiosError>({
    queryKey: ['daily-macros'],
    fetcher: () => getDailyMacrosRequest({ date }),
  })();

export const useGetMacrosDateRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) =>
  createQuery<DailyMacroLogResponse, IGetDailyMacrosByDateRange, AxiosError>({
    queryKey: ['daily-macros-by-range', startDate, endDate],
    fetcher: () => getMacrosPerDateRange({ startDate, endDate }),
  })();

export const useDeleteMacroEntry = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) =>
  createMutation<ICreateMacroResponseData, IDeleteMacroEntry, AxiosError>({
    mutationFn: (variables) => deleteMacroEntry(variables),
    onSuccess: (data) => {
      Toast.success('Macro entry deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['daily-macros'] });
      queryClient.invalidateQueries({
        queryKey: ['daily-macros-by-range', startDate, endDate],
      });
    },
    onError: () => {
      Toast.error('Error deleting  macro log');
    },
  })();
