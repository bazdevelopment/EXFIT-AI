export const extractStructuredMacro = (interpretationResult: string) => {
  // Check if the delimiter exists in the string
  const hasJson =
    interpretationResult.includes('JSON_START') &&
    interpretationResult.includes('JSON_END');

  let chatText = interpretationResult;
  let extractedData = null;

  if (hasJson) {
    const parts = interpretationResult.split(/JSON_START|JSON_END/);
    chatText = parts[0] + (parts[2] || ''); // Keep the text before and after the JSON

    try {
      extractedData = JSON.parse(parts[1].trim());
    } catch (e) {
      console.error('Invalid JSON format from AI', e);
    }
  }

  return { chatText, extractedData };
};
