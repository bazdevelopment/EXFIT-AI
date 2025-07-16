import { GoogleGenAI } from '@google/genai';
import { Request } from 'firebase-functions/v1/https';
import { v4 as uuidv4 } from 'uuid';

import dayjs from '../dayjs';
import { checkDailyScanLimit } from '../utilities/check-daily-scan-limit';
import { convertBufferToBase64 } from '../utilities/convert-buffer-base-64';
import {
  handleOnRequestError,
  logError,
  throwHttpsError,
} from '../utilities/errors';
import { generateUniqueId } from '../utilities/generate-unique-id';
import { LANGUAGES } from '../utilities/languages';
import { processUploadedFile } from '../utilities/multipart';
import { admin } from './common';
import { getTranslation } from './translations';

const db = admin.firestore();

const analyzeScanImageConversationHandler = async (req: Request, res: any) => {
  try {
    const { files, fields } = await processUploadedFile(req);
    const languageAbbreviation = req.headers['accept-language'];

    const additionalLngPrompt = `THE LANGUAGE USED FOR RESPONSE SHOULD BE: ${LANGUAGES[languageAbbreviation as keyof typeof LANGUAGES]} FROM NOW ON.`;

    const t = getTranslation(languageAbbreviation as string);
    const { userId, promptMessage } = fields;
    const [imageFile] = files;
    const userPromptInput = promptMessage
      ? `THE USER ASKED THIS: ${promptMessage}`
      : '';
    const userDoc = db.collection('users').doc(userId);
    const userInfoSnapshot = await userDoc.get();
    const storage = admin.storage();

    if (!userInfoSnapshot.exists) {
      throwHttpsError('unauthenticated', t.common.noUserFound);
    }

    const { lastScanDate, scansToday } = userInfoSnapshot.data() as {
      lastScanDate: string;
      scansToday: number;
    };

    if (!userId) {
      handleOnRequestError({
        error: { message: t.common.userIdMissing },
        res,
        context: 'Analyze image',
      });
    }
    if (!imageFile.buf) {
      handleOnRequestError({
        error: { message: t.analyzeImage.imageMissing },
        res,
        context: 'Analyze image',
      });
    }

    // First check daily limits (new logic)
    const canScanResult = await checkDailyScanLimit({
      userId,
      lastScanDate,
      scansToday,
      dailyLimit: 50,
    });
    if (!canScanResult.canScan) {
      const limitReachedMessage = 'Scan Limit Reached';
      logError('Analyze Image Conversation Error', {
        message: limitReachedMessage,
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
      return res.status(500).json({
        success: false,
        message: limitReachedMessage,
      });
    }

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const base64String = convertBufferToBase64(imageFile.buf);

    const conversationPrompt = `${additionalLngPrompt}.${userPromptInput}. ${process.env.IMAGE_ANALYZE_PROMPT}.`;

    const imagePart = {
      inlineData: {
        data: base64String,
        mimeType: imageFile.mimeType,
      },
    };

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: conversationPrompt }, imagePart],
        },
      ],
    });

    const textResult = result.text;
    /* Logic for storing the image in db */
    // Generate a unique filename
    const uniqueId = generateUniqueId();
    const filePath = `interpretations/${userId}/${uniqueId}`;
    const bucket = storage.bucket();

    // Upload the image to Firebase Storage
    const file = bucket.file(filePath);
    const token = uuidv4();
    try {
      await file.save(imageFile.buf, {
        metadata: {
          contentType: imageFile.mimeType,
          metadata: {
            firebaseStorageDownloadTokens: token, // ! Add token for preview in the dashboard this add an access token to the image otherwise it wont be visible in the dashboard
          },
        },
      });

      // Make the file publicly readable
      await file.makePublic();
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      return res.status(500).json({
        success: false,
        message: t.analyzeImage.uploadImageStorageError,
      });
    }
    const url = file.publicUrl();

    // Save the analysis result and metadata in Firestore
    try {
      const analysisDocRef = admin
        .firestore()
        .collection('interpretations')
        .doc();
      const createdAt = admin.firestore.FieldValue.serverTimestamp();

      // Create a new conversation document
      const conversationDocRef = admin
        .firestore()
        .collection('conversations')
        .doc();

      await conversationDocRef.set({
        userId,
        messages: [
          {
            role: 'user',
            content: [
              // Add image URL (mandatory)
              {
                fileData: {
                  mimeType: 'image/jpeg',
                  fileUri: url, // Always include the image URL
                },
              },
            ],
          },
          ...(promptMessage
            ? [{ role: 'user', content: promptMessage || '' }]
            : []),
          {
            role: 'model',
            content: textResult, // Assistant's response
          },
        ],
        createdAt,
        updatedAt: createdAt,
        imageUrl: url, // Store the image URL separately
        promptMessage: promptMessage || '', // Store the prompt message separately (if it exists)
      });

      await analysisDocRef.set({
        userId,
        url,
        filePath,
        interpretationResult: textResult,
        createdAt,
        id: uniqueId,
        mimeType: imageFile.mimeType,
        promptMessage: promptMessage || '',
        conversationId: conversationDocRef.id,
      });

      // Increment the scans
      const today = new Date().toISOString().split('T')[0];

      await userDoc.update({
        completedScans: admin.firestore.FieldValue.increment(1),
        scansToday: admin.firestore.FieldValue.increment(1),
        scansRemaining: admin.firestore.FieldValue.increment(-1),
        lastScanDate: today,
      });

      res.status(200).json({
        success: true,
        message: t.analyzeImage.analysisCompleted,
        interpretationResult: textResult,
        promptMessage: promptMessage || '',
        createdAt: dayjs().toISOString(),
        conversationId: conversationDocRef.id, // Return the conversation ID for future messages
      });
    } catch (error) {
      console.error('Error saving analysis metadata to Firestore:', error);
      return res.status(500).json({
        success: false,
        message: t.analyzeImage.interpretationNotSaved,
      });
    }
  } catch (error: any) {
    handleOnRequestError({
      error,
      res,
      context: 'Analyze image',
    });
  }
};

export { analyzeScanImageConversationHandler };
