import { GoogleGenerativeAI } from '@google/generative-ai';
import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { LANGUAGES } from '../utilities/languages';
import { admin } from './common';

// Define a dedicated prompt for the Excuse Buster Chatbot
const responseGuidelinesExcuseBuster = `
You are an AI assistant tasked with motivating users to start a fitness activity TODAY. Your goal is to shatter the user's procrastination and secure a commitment to a specific physical activity within 8-12 interactions.

Here's how you should operate:

1. Persona: You are fierce, direct, and brutally motivational. You don't accept excuses; you dissect them. Your voice should reflect this throughout your interactions.

2. Mission: Your sole purpose is to get the user to take action TODAY doing some body movement even for 5 minutes. You must confront their excuses, expose their true motivations, and secure a non-negotiable commitment to a specific physical activity TODAY.

3. Core Tactics:
   a. Use brutal honesty. Refer to excuses as "lies you tell yourself" and their potential as a "beast you've been starving."
   b. The Five Whys: Drill past surface excuses by repeatedly asking "Why?" to hit the emotional core.
   c. OARS - Use Open Questions, Affirmations (tough love), Reflective Listening, and Summaries to challenge and motivate.
   d. CBT (Excuse Re-framing): Identify and challenge negative self-talk.
   e. Implementation Intentions & Temptation Bundling: Lock in specific commitments.

4. JSON Response Formats:
   You must use one of these three JSON formats for every reply:

   a. Standard Interaction:
   {
     "responseText": "Your motivational reply here",
     "buttons": [
       { "id": "choice_1_unique_id", "text": "Option 1" },
       { "id": "choice_2_unique_id", "text": "Option 2" },
       { "id": "input_prompt_id", "text": "Or type your reason...", "isTextInputPrompt": true }
     ],
     "isFinalStep": false
   }

   b. Final Task Confirmation:
   {
     "responseText": "No turning back! The contract is signed. Crush this NOW!",
     "isFinalStep": true,
     buttons:[],
     "task": {
       "title": "Activity Title",
       "description": "Activity description",
       "durationMinutes": duration
     }
   }

   c. No-Options Assault:
   {
     "responseText": "Your direct challenge or powerful statement here",
     "buttons": [],
     "isFinalStep": false
   }

5. Important Notes:
   - Always include one button with "isTextInputPrompt": true in the Standard Interaction format.
   - If the user sks for demos/videos use in the response YouTube links that can be clickable and be open in an outside browser, use the format: https://m.youtube.com/results?search_query=your+search+terms+here
   - Use the Scaling Question early to uncover motivation.
   - Use comparison techniques (e.g., While Someone’s grinding at the gym while you’re sitting back and complaining)

6. Handling User Input:
   When you receive a user input, analyze it and respond accordingly:

   Based on this input, choose the appropriate JSON response format and craft your reply. Use the core tactics to challenge excuses, dig deeper into motivations, and push the user towards commitment.

7. Securing Commitment:
   After 8-10 messages interactions, focus on obtaining a clear commitment from the user. They must explicitly state the [fitness activity name[] they plan to do. Once confirmed, use the Final Task Confirmation format, setting "isFinalStep": true and give back the JSON format that has "isFinalStep": true mentioned.
8. Encourage the user to respond with the name of [physical activity] they intend to complete today at [Time], at [Place], lasting [Minutes] and to mention the [physical activity] (gym/streching/running/yoga and so on)
Remember, your goal is to motivate the user to start a fitness activity TODAY. Be relentless, challenging, and don't accept weak excuses. Push for a specific, actionable commitment within the 8-10 interactions limit.
`;

const db = admin.firestore();

const getExcuseBusterConversationHandler = async (
  data: { conversationId: string },
  context: any,
) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication is required to fetch the conversation.',
    );
  }

  // Extract conversationId from data payload
  const conversationId = data.conversationId;

  if (!conversationId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'conversationId is required.',
    );
  }

  try {
    // Fetch the conversation document from Firestore
    const conversationDoc = await admin
      .firestore()
      .collection('conversationsExcuseBuster')
      .doc(conversationId)
      .get();

    // Check if the conversation exists
    if (!conversationDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Conversation not found.',
      );
    }

    // Extract conversation data
    const conversationData = conversationDoc.data();

    // Return the conversation data
    return {
      success: true,
      conversation: conversationData,
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw new functions.https.HttpsError('internal', 'Internal Server Error');
  }
};

const continueExcuseBusterConversation = async (
  data: {
    conversationId: string;
    language: string;
    userMessage?: string;
    conversationMode?: string;
  },
  context: any,
) => {
  // let t;

  try {
    const { conversationId, userMessage, language } = data;

    const userId = context.auth.uid;
    const languageAbbreviation = language;
    // t = getTranslation(languageAbbreviation as string);

    const additionalLngPrompt = `THE LANGUAGE USED FOR RESPONSES SHOULD BE: ${LANGUAGES[languageAbbreviation as keyof typeof LANGUAGES]} FROM NOW ON.`;

    if (!userId || !userMessage) {
      throwHttpsError(
        'invalid-argument',
        'Missing required fields (conversationId, userMessage)',
      );
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

    const userDocRef = db.collection('users').doc(userId);
    const conversationDocRef = db
      .collection('conversationsExcuseBuster')
      .doc(conversationId);

    let messages: any[] = [];

    try {
      const [userSnapshot, conversationSnapshot] = await Promise.all([
        userDocRef.get(),
        conversationDocRef.get(),
      ]);

      if (!userSnapshot.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User document not found.',
        );
      }

      const userData = userSnapshot.data() || {};

      if (!conversationSnapshot.exists) {
        // Create a new conversation if it doesn't exist
        await conversationDocRef.set({
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          messages: [],
          trigger: 'excuse_buster',
        });
      } else {
        messages = conversationSnapshot.data()?.messages || [];
      }
      // Prepare History and Prompt for the AI Model
      const history = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: `${msg.content.responseText}`,
          },
        ],
      }));

      const fullPrompt = `
        ${responseGuidelinesExcuseBuster}

        # User Information
        - User's Name: ${userData.userName || 'friend'}
        - User's Fitness Goals: ${(userData.onboarding?.fitnessGoals || ['general fitness']).join(', ')}
        - User's gender is: ${userData.onboarding.gender}

        # Current User Message or Excuse
        ${userMessage}

        # Task
        Based on all the information and history above, generate the next response in the correct JSON format.

        # Language
        ${additionalLngPrompt}
      `;

      // Call the Gemini AI Model
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-preview-04-17',
        // model: 'gemini-2.5-flash-lite-preview-06-17',
      });

      const chat = model.startChat({
        history,
        generationConfig: { maxOutputTokens: 1024 },
      });

      const result = await chat.sendMessage(fullPrompt);
      const response = await result.response;
      const assistantResponseText = response.text();

      // Parse AI Response and Update Firestore
      let assistantJsonResponse;
      try {
        const match = assistantResponseText?.match(/\{[\s\S]*\}/);
        if (!match || !match[0]) {
          throw new functions.https.HttpsError(
            'internal',
            'The AI response did not contain valid JSON.',
          );
        }
        let jsonStr = match[0]; // Get the JSON part
        jsonStr = jsonStr.replace('false.', 'false'); // Fix invalid JSON

        // Parse the cleaned JSON
        // const assistantResponseTextJSON = JSON.parse(jsonStr);
        assistantJsonResponse = JSON.parse(jsonStr);
      } catch (e) {
        functions.logger.error(
          'AI response was not valid JSON:',
          assistantResponseText,
          e,
        );
        throw new functions.https.HttpsError(
          'internal',
          'The AI coach had a problem responding. Please try again.',
        );
      }

      // Update conversation with the new messages
      await conversationDocRef.update({
        messages: [
          ...messages,
          { role: 'user', content: { responseText: userMessage } },
          { role: 'assistant', content: assistantJsonResponse },
        ],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the Structured JSON to the Client
      return assistantJsonResponse;
    } catch (error: any) {
      functions.logger.error('Error in getExcuseBusterResponse:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        'An unexpected error occurred.',
      );
    }
  } catch (err) {
    functions.logger.error(
      'Outer error in continueExcuseBusterConversation:',
      err,
    );
    throw new functions.https.HttpsError('internal', 'Unexpected outer error.');
  }
};

export { continueExcuseBusterConversation, getExcuseBusterConversationHandler };
