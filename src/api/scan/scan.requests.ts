import axios from 'axios';

import { Env } from '@/core/env';

export const scanImage = async (payload: FormData, language: string) => {
  try {
    const response = await axios.post(
      Env.EXPO_PUBLIC_ANALYZE_SCAN_IMAGE_CONVERSATION as string,
      payload,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'Accept-Language': language,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
