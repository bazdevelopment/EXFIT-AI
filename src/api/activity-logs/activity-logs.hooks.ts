import { type AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';
import { translate } from '@/core';

import { queryClient } from '../common';
import {
  createActivityLog,
  getCalendarActivity,
  updateActivityLog,
} from './activity-logs.requests';
import {
  type CalendarStatusMap,
  type ICreateLogRequestData,
  type ICreateLogResponseData,
  type IRequestCalendarActivity,
  type IUpdateLogRequestData,
  type IUpdateLogResponseData,
} from './activity-logs.types';

export const useCreateActivityLog = ({ onSuccess }) =>
  createMutation<ICreateLogResponseData, ICreateLogRequestData, AxiosError>({
    mutationFn: (variables) => createActivityLog(variables),
    onSuccess: (data) => {
      onSuccess &&
        onSuccess({ xpReward: data.xpEarned, gemsReward: data.gemsEarned });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
      queryClient.invalidateQueries({
        queryKey: ['activity-logs'],
      });
    },
    onError: () => {
      Toast.error(translate('alerts.createActivityLogFailed'));
    },
  })();

export const useUpdateActivityLog = () =>
  createMutation<IUpdateLogResponseData, IUpdateLogRequestData, AxiosError>({
    mutationFn: (variables) => updateActivityLog(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['activity-logs'],
      });
      queryClient.invalidateQueries({ queryKey: ['user-info'] });
    },
    onError: () => {
      Toast.error(translate('alerts.updateActivityLogFailed'));
    },
  })();

export const useGetCalendarActivityLog = (
  variables: IRequestCalendarActivity
) =>
  createQuery<CalendarStatusMap, IRequestCalendarActivity, AxiosError>({
    queryKey: ['activity-logs', variables.startDate, variables.endDate],
    fetcher: () => getCalendarActivity(variables),
  })();
