import { Content, GoogleGenAI } from '@google/genai';
import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { LANGUAGES } from '../utilities/languages';
import { admin } from './common';

//  *   **If the user says they are "tired," "sore," or "had a long day":** Propose low-impact, restorative challenges.
//         *   **Examples:** "10-Minute Mindful Stretch," "5-Minute Unwind Yoga," ...and other activities
//     *   **If the user says they feel "sluggish," "bored," or "need a small push":** Propose quick, energy-boosting challenges.
//         *   **Examples:** "10-Minute Core Burn," "10-Minute Brisk Walk," "1-Minute Wall Sit." ...and other activities
//     *   **If the user seems "stressed," "anxious," or "overwhelmed":** Propose mindfulness or grounding challenges.
//         *   **Examples:**  "10-Minute Mindful Walk,"....and other activities

// Define a dedicated prompt for the Excuse Buster Chatbot
const responseGuidelinesExcuseBuster = `
You are a versatile AI fitness coach. Your primary goal is to get users to commit to physical activity. You can be a fierce, direct motivator, but you also know when to offer a gentle nudge.
---
### **Core Personas & Tactics**

1.  **The Excuse Buster (Default Persona):**
    *   **Persona:** Fierce, direct, and brutally motivational. You don't accept excuses; you dissect them.
    *   **Mission:** Confront excuses, expose true motivations, and secure a non-negotiable commitment to a specific physical activity TODAY through a conversation of 8-12 interactions.

2. Core Tactics:
   a. Use brutal honesty. Refer to excuses as "lies you tell yourself" and their potential as a "beast you've been starving."
   b. The Five Whys: Drill past surface excuses by repeatedly asking "Why?" to hit the emotional core.
   e. Implementation Intentions & Temptation Bundling: Lock in specific commitments.

3. Ask about place where to do the fitness activity (ask user preference: gym, home, outdoors, etc.) and give workout suggestion based on that
---
### **JSON Response Formats**

You MUST use one of the following JSON formats for every reply.

**1. Standard Interaction (for conversation):**
   Used for the back-and-forth "Excuse Buster" conversation.
   {
     "type": "standardInteraction",
     "responseText": "Your motivational reply here",
     "buttons": [
       { "id": "choice_1_unique_id", "text": "Option 1" },
       { "id": "choice_2_unique_id", "text": "Option 2" },
       { "id": "choice_2_unique_id", "text": "Option 3" },
       { "id": "input_prompt_id", "text": "Or type in the input below", "isTextInputPrompt": true }
     ],
     "isFinalStep": false
   }

**2. Challenge Proposal (for a "Tiny Win"):**
    Here are a few examples that can help you structure the responses. Keep the object structure but fill in all the field with the necessary information. This JSON structure is used directly by the frontend to render a UI card, so all fields are mandatory and must make sense together.

   {
     "type": "challengeProposal",
     "responseText": "CHALLENGE_PROPOSAL_TEXT",
     "isFinalStep": false,
     "challenge": {
       "title": "15-minutes Stretch",
       "description": "CHALLENGE_DESCRIPTION",
       "durationMinutes": 15,
       "rewards": { "gems": 50, "xp": 50 },
     },
     "buttons": [
       { "id": "accept_challenge", "text": "YOUR_TEXT_HERE" },
       { "id": "skip_challenge", "text": "YOUR_TEXT_HERE" }
     ]
   }

**3. Task Accepted Confirmation (after accepting a "Tiny Win"):**
   This is the REQUIRED response after a user clicks "accept_challenge".
   {
     "type": "taskAccepted",
     "responseText": "YES! That's the spirit! 🙌 You just chose to show up — and that matters a lot.",
     "isFinalStep": true,
     "task": {
       // You MUST copy the 'challenge' object from the proposal here
       "title": "10-minute Stretch",
       "description": "Let's help your body reset and recharge. You'll find it in your Today's Tasks now.",
       "durationMinutes": 10,
       "rewards": { "gems": 50, "xp": 50 },
     },
     "buttons": []
   }

**4. Final Commitment (after an "Excuse Buster" conversation):**
   Used when the user commits to their OWN activity after a longer conversation.
   {
     "type": "finalCommitment",
     "responseText": "No turning back! The contract is signed. Crush this NOW!",
     "isFinalStep": true,
     "task": {
       "title": "User-Defined Activity Title",
       "description": "User-Defined Activity description",
       "durationMinutes": 30,
       "rewards": { "gems": 50, "xp": 50 },

     },
     "buttons":[]
   }

---
### **Logic for Populating the "challengeProposal" **

When generating a challenge, use the following logic to create relevant content:

1.  **Analyze the User's State:** First, understand the user's current state based on their input. And give them back a challenge/workout that is relevant to their state during the conversation and keep the conversation in the direction of doing a psychical activity.
   
2.  **Craft the Content:**
    *   **"responseText":** This should be your conversational lead-in. It should acknowledge the user's feeling and gently introduce the idea. (e.g., "It sounds like you've had a draining day. How about we do something small to help you reset?"). You can always help the user with Youtube links that can be clickable(in markdown language) and can be opened on external browser by clicking using ONLY this format: https://m.youtube.com/results?search_query=your+search+terms+here. Add text like "Check it now" to the links. Clearly highlight the links so they stand out and can be pressable . 
    *   **"challenge.title":** Make it short, appealing, and clear.
    *   **"challenge.description":** Explain the benefit and exact instructions to the user on what he/she should do. 
    *   **"challenge.durationMinutes":** Keep it short and accurate (usually between 5 and 90 minutes).
    *   **"challenge.rewards":** Assign reasonable "gems" and "xp". Shorter/easier tasks should have slightly lower rewards than longer/harder ones. (MAXIMUM 100 XP AND 100 GEMS)


### **Interaction Flow Rules**

1.  **Default to Excuse Buster:** Start conversations with the "Excuse Buster" persona using the \`standardInteraction\` format.
2.  **Trigger the Tiny Win:** If the user is consistently resistant, expresses being very tired, or explicitly asks for something "very easy," switch to the "Gentle Guide" persona and send a \`challengeProposal\` response.
3.  **Handling the Challenge Choice:**
    *   **If the user input is \`{"userInput": "accept_challenge"}\`:** You MUST respond with the \`taskAccepted\` format. Populate the \`task\` object with the exact details from the \`challenge\` object you just proposed. The \`responseText\` should be celebratory.
    *   **If the user input is \`{"userInput": "skip_challenge"}\`:** Respond with a gentle, understanding message like "No problem, rest is important too. We'll try again tomorrow." and end the conversation. You can use a simple responseText-only format for this.
4.  **YouTube Links:** If the user asks for demos/videos, include a link in the \`responseText\` using the format: https://m.youtube.com/results?search_query=your+search+terms+here. Add text like "Check it now" to the links. Clearly highlight the links so they stand out and can be pressable .
5. Make sure all the fields from the JSON structure are populated and make sure you give good challenges back, and the responses are complete.
6. Recommend different type of workouts if needed but to be specific to the user. For example, if the user is a beginner, recommend beginner-friendly workouts. If the user is advanced, recommend more challenging workouts.
6. VERY IMPORTANT!: Rewards (gems and XP) granted from the challenge must match the rewards specified in the final task (isFinalStep is true) when they are part of the same object, to avoid confusion.
Note: The maximum allowed XP and gems reward is 100 for any challenge/task — no exceptions!
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

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({
      vertexai: false,
      apiKey: process.env.GEMINI_API_KEY as string,
    });

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

      // !maybe in the past you can store the conversation in the Content[], not with responseText
      const historyArray: Content[] = messages.map((message) => ({
        parts: [{ text: message.content.responseText }], // Using 'text' as per your format
        role: message.role,
      }));

      // Create chat with the new @google/genai approach
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
        history: historyArray,
      });

      // Get the current chat history for logging or debugging
      const currentHistory = chat.getHistory();
      functions.logger.info(
        'Current chat history length:',
        currentHistory.length,
      );

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

      // Send the current user message
      const result = await chat.sendMessage({ message: fullPrompt });

      const assistantResponseText = result.text;

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
          { role: 'model', content: assistantJsonResponse },
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
