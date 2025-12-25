import { type AxiosError } from 'axios';
import { router } from 'expo-router';
import { createMutation, createQuery } from 'react-query-kit';

import Toast from '@/components/toast';
import { translate } from '@/core';

import { queryClient } from '../common';
import {
  createAiTaskRequest,
  fetchAiTasks,
  updateAiTaskNotes,
  updateAiTaskStatus,
} from './ai-taks.requests';
import {
  type ICreateTaskRequestData,
  type ITaskUpdateRequestData,
  type ITaskUpdateStatusResponse,
  type IUpdateTaskNotesRequest,
  type IUpdateTaskNotesResponse,
} from './ai-tasks.types';

export const useGetAiTasks = (date: string) => {
  return createQuery({
    queryKey: ['ai-tasks', date],
    fetcher: () => fetchAiTasks({ date }),
  })();
};

export const useCreateAiTask = (date: string) =>
  createMutation<{ taskId: string }, ICreateTaskRequestData, AxiosError>({
    mutationFn: (variables) => createAiTaskRequest(variables),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-tasks', date],
      });
      Toast.success(translate('alerts.challengeAccepted'));
      router.navigate('/(app)');
    },
    onError: (error) => {
      Toast.error(error.response.data.message);
    },
  })();

export const useUpdateAiTaskStatus = (date: string) =>
  createMutation<ITaskUpdateStatusResponse, ITaskUpdateRequestData, AxiosError>(
    {
      mutationFn: (variables) => updateAiTaskStatus(variables),
      onSuccess: (data) => {
        Toast.success(translate('alerts.challengeCompleted'));

        queryClient.invalidateQueries({
          queryKey: ['ai-tasks', date],
        });
      },
      onError: (error) => {
        Toast.error(error.response.data.message);
      },
    }
  )();

export const useUpdateAiTaskNotes = createMutation<
  IUpdateTaskNotesResponse,
  IUpdateTaskNotesRequest,
  AxiosError
>({
  mutationFn: (variables) => updateAiTaskNotes(variables),
  onSuccess: (data) => {
    Toast.success(data.message);

    queryClient.invalidateQueries({
      queryKey: ['ai-tasks'],
    });
  },
  onError: (error) => {
    Toast.error(error.response.data.message);
  },
});
