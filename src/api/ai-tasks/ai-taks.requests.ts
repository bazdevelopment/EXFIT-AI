import { firebaseCloudFunctionsInstance } from 'firebase/config';

import {
  type AiTaskResponse,
  type ICreateTaskRequestData,
  type ITaskUpdateRequestData,
  type ITaskUpdateStatusResponse,
  type IUpdateTaskNotesRequest,
  type IUpdateTaskNotesResponse,
} from './ai-tasks.types';

export const fetchAiTasks = async ({
  date,
}: {
  date: string;
}): Promise<AiTaskResponse[]> => {
  try {
    const { data } = await firebaseCloudFunctionsInstance.httpsCallable(
      'getAiTasks'
    )({ date });

    return data as AiTaskResponse[];
  } catch (error) {
    throw error;
  }
};

export const createAiTaskRequest = async (
  payload: ICreateTaskRequestData
): Promise<{ taskId: string }> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('createAiTask')(
        payload
      );
    return data as { taskId: string };
  } catch (error) {
    throw error;
  }
};

export const updateAiTaskStatus = async (
  payload: ITaskUpdateRequestData
): Promise<ITaskUpdateStatusResponse> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('updateAiTaskStatus')(
        payload
      );
    return data as ITaskUpdateStatusResponse;
  } catch (error) {
    throw error;
  }
};

export const updateAiTaskNotes = async (
  payload: IUpdateTaskNotesRequest
): Promise<IUpdateTaskNotesResponse> => {
  try {
    const { data } =
      await firebaseCloudFunctionsInstance.httpsCallable('updateAiTaskNotes')(
        payload
      );
    return data as IUpdateTaskNotesResponse;
  } catch (error) {
    throw error;
  }
};
