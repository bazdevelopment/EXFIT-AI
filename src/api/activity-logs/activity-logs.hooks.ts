import { type AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';

import { queryClient } from '../common';
import {
  createActivityLog,
  getCalendarActivity,
} from './activity-logs.requests';
import {
  type CalendarStatusMap,
  type ICreateLogRequestData,
  type ICreateLogResponseData,
  type IRequestCalendarActivity,
} from './activity-logs.types';

export const useCreateActivityLog = ({ onSuccess }) =>
  createMutation<ICreateLogResponseData, ICreateLogRequestData, AxiosError>({
    mutationFn: (variables) => createActivityLog(variables),
    onSuccess: (data) => {
      // Toast.success(data.message || 'Activity log created successfully');
      onSuccess();
      queryClient.invalidateQueries({
        queryKey: ['activity-logs'],
      });
    },
    onError: () => {
      Toast.error('Error creating activity log');
    },
  })();

export const useGetCalendarActivityLog = (
  variables: IRequestCalendarActivity
) =>
  createQuery<CalendarStatusMap, IRequestCalendarActivity, AxiosError>({
    queryKey: ['activity-logs', variables.startDate, variables.endDate],
    fetcher: () => getCalendarActivity(variables),
  })();
