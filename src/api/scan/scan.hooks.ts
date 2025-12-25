import { useMutation } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { router } from 'expo-router';
import { generateUniqueId } from 'functions/utilities/generate-unique-id';

import { queryClient } from '@/api';
import Toast from '@/components/toast';
import { translate } from '@/core';
import { useCrashlytics } from '@/core/hooks/use-crashlytics';
import { getTimeUntilMidnight } from '@/core/utilities/get-time-until-midnight';

import { scanImage } from './scan.requests';

type Response = any;

interface IAnalyzeImageParams {
  interpretationResult: string;
  promptMessage: string;
  createdDate: string;
  conversationId: string;
}

export const useScanImage = ({
  onSuccessCallback,
  language,
  // handleCloseScanningModal,
  // resetFlow,
}: {
  onSuccessCallback: ({
    interpretationResult,
    promptMessage,
    createdDate,
  }: IAnalyzeImageParams) => void;
  language: string;
  // handleCloseScanningModal: () => void;
  // resetFlow: () => void;
}) => {
  const { logEvent, recordError } = useCrashlytics();

  return useMutation<Response, AxiosError, FormData>({
    mutationFn: (variables) => scanImage(variables, language),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recent-interpretations'] });
      logEvent('Medical image has been analyzed successfully');
      onSuccessCallback({
        interpretationResult: data.interpretationResult,
        promptMessage: data.promptMessage,
        createdDate: data.createdAt,
        conversationId: data.conversationId,
      });
    },
    onError: (error: any) => {
      const isLimitReachedError = error.response.data.message
        .toLowerCase()
        .includes('limit');
      if (isLimitReachedError) {
        const { hours, minutes } = getTimeUntilMidnight();
        const limitReachedMessage = translate('alerts.scanLimitReached', {
          hours,
          minutes,
        });

        logEvent(
          'Failure when analyzing medical image - scan limit reached',
          'error'
        );
        recordError(
          error,
          'Failure when analyzing medical image - scan limit reached'
        );

        return Toast.warning(limitReachedMessage, {
          closeButton: true,
          duration: 10000000,
          action: {
            label: translate('general.askAssistant'),
            onClick: () => {
              Toast.dismiss();
              // handleCloseScanningModal();
              router.navigate({
                pathname: '/chat-screen',
                params: {
                  conversationId: generateUniqueId(),
                  mediaSource: '',
                  mimeType: '',
                  conversationMode: 'RANDOM_CONVERSATION',
                },
              });
              // resetFlow();
            },
          },
        });
      }
      Toast.error(error.response.data.message);
      logEvent('Failure when analyzing medical image', 'error');
      recordError(error, 'Failure when analyzing medical image');
    },
  });
};
