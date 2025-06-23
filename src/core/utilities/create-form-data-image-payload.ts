export const createFormDataImagePayload = ({
  fileUri,
  fileName,
  fileMimeType,
  userId,
  // promptMessage,
  // highlightedRegions,
}: {
  fileUri: string;
  fileMimeType: string;
  fileName?: string;
  userId: string;
  promptMessage?: string;
}) => {
  const formData = new FormData();
  // @ts-expect-error: special react native format for form data
  formData.append('image', {
    uri: fileUri,
    name: fileName ?? fileUri?.split('/').pop(),
    type: fileMimeType,
  });

  formData.append('userId', userId);
  // formData.append('promptMessage', promptMessage);
  // formData.append('highlightedRegions', highlightedRegions);

  return formData;
};
