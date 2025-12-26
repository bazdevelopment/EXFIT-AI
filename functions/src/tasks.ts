/* eslint-disable valid-jsdoc */
import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { admin } from './common';
import { getTranslation } from './translations';

interface ICreateTaskRequestData {
  trigger: string; // e.g., "excuse_buster_no_time"
  title: string; // e.g., "Energy Boost Challenge"
  durationMinutes: number; // e.g., 10
  language: string;
  xpReward: number;
  gemsReward: number;
  description: string;
}

interface AiTaskDocument {
  createdAt: admin.firestore.FieldValue;
  expiresAt: admin.firestore.Timestamp;
  trigger: string;
  gemsReward: number;
  xpReward: number;
  description: string;
  title: string;
  durationMinutes: number;
  status: 'active' | 'completed' | 'skipped' | 'expired';
  notes?: string;
}

const db = admin.firestore();

const createAiTasksHandler = async (
  data: ICreateTaskRequestData,
  context: functions.https.CallableContext,
): Promise<{ taskId: string }> => {
  {
    // const t = getTranslation(data.language);

    // 1. --- AUTHENTICATION & VALIDATION ---

    if (!context.auth) {
      throwHttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      );
    }

    const userId = context.auth.uid;

    if (
      !data.trigger ||
      !data.title ||
      !data.language ||
      data.durationMinutes == null ||
      !data.xpReward ||
      !data.gemsReward
    ) {
      throwHttpsError(
        'invalid-argument',
        'Missing required fields: trigger, title, language,xpReward, gemsReward or durationMinutes.',
      );
    }

    functions.logger.info(`Creating AI task for user ${userId}`, { data });

    // 2. --- PREPARE THE TASK DOCUMENT ---
    const now = new Date();
    const expiryTime = new Date(now);
    expiryTime.setHours(23, 59, 59, 999); // Set expiry to midnight of the current day

    const newTask: AiTaskDocument = {
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiryTime),
      trigger: data.trigger,
      title: data.title,
      durationMinutes: data.durationMinutes,
      description: data.description || '',
      gemsReward: data.gemsReward,
      xpReward: data.xpReward,
      status: 'active', // A new task always starts as active
    };

    // 3. --- WRITE TO FIRESTORE (Single 'add' operation) ---
    try {
      const taskCollectionRef = db
        .collection('users')
        .doc(userId)
        .collection('aiTasks');

      const docRef = await taskCollectionRef.add(newTask);

      functions.logger.info(
        `Successfully created task ${docRef.id} for user ${userId}.`,
      );

      // 4. --- RETURN THE NEW TASK ID ---
      return { taskId: docRef.id };
    } catch (error) {
      functions.logger.error(
        `Error creating AI task for user ${userId}:`,
        error,
      );

      throwHttpsError(
        'internal',
        'Failed to create the AI task. Please try again.',
      );
    }
  }
};

// (This would be in the same index.ts file as the function above)

// ===================================================================
// TYPE DEFINITIONS for the Get Tasks Function
// ===================================================================

/**
 * The data payload that the CLIENT will send to the `getAiTasksForDay` function.
 */
interface IGetTasksRequestData {
  date: string; // Expected in "YYYY-MM-DD" format.
}

/**
 * The structure of a single task object that will be returned to the client.
 */
interface AiTaskResponse {
  id: string;
  createdAt: string; // ISO string for easy parsing on the client
  expiresAt: string; // ISO string
  trigger: string;
  title: string;
  xpReward: number;
  gemsReward: number;
  description: string;
  durationMinutes: number;
  status: 'active' | 'completed' | 'skipped' | 'expired';
}

/**
 * A Callable Cloud Function to fetch all AI tasks for a specific day.
 *
 * @param {IGetTasksRequestData} data - The IGetTasksRequestData from the client.
 * @param {any} context - The context of the call, including auth info.
 * @return {Promise<AiTaskResponse[]>} An array of AiTaskResponse objects.
 */
const getAiTasksForDay = async (
  data: IGetTasksRequestData,
  context: functions.https.CallableContext,
): Promise<AiTaskResponse[]> => {
  // 1. --- AUTHENTICATION & VALIDATION ---
  if (!context.auth) {
    throwHttpsError(
      'unauthenticated',
      'The function must be called while authenticated',
    );
  }

  const userId = context.auth.uid;

  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throwHttpsError(
      'invalid-argument',
      "A valid 'date' in YYYY-MM-DD format is required.",
    );
  }

  // 2. --- CREATE DATE RANGE FOR THE QUERY ---
  const startOfDay = new Date(`${data.date}T00:00:00.000Z`);
  const endOfDay = new Date(`${data.date}T23:59:59.999Z`);

  const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
  const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);

  functions.logger.info(`Fetching AI tasks for user ${userId} on ${data.date}`);

  // 3. --- QUERY FIRESTORE ---
  try {
    const tasksSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('aiTasks')
      .where('createdAt', '>=', startTimestamp)
      .where('createdAt', '<=', endTimestamp)
      .orderBy('createdAt', 'desc') // Show newest tasks first
      .get();

    // 4. --- PROCESS AND MAP THE RESULTS ---
    const tasks: AiTaskResponse[] = tasksSnapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        createdAt: (docData.createdAt as admin.firestore.Timestamp)
          .toDate()
          .toISOString(),
        expiresAt: (docData.expiresAt as admin.firestore.Timestamp)
          .toDate()
          .toISOString(),
        trigger: docData.trigger,
        title: docData.title,
        durationMinutes: docData.durationMinutes,
        status: docData.status,
        gemsReward: docData.gemsReward,
        xpReward: docData.xpReward,
        description: docData.description,
      };
    });

    functions.logger.info(
      `Found ${tasks.length} tasks for user ${userId} on ${data.date}.`,
    );
    return tasks;
  } catch (error) {
    functions.logger.error(
      `Error fetching AI tasks for user ${userId}:`,
      error,
    );

    throwHttpsError('internal', 'Failed to retrieve tasks. Please try again.');
  }
};

/**
 * The data payload that the CLIENT will send. It now includes the desired status.
 */
interface IResolveTaskRequestData {
  taskId: string;
  status: 'completed' | 'skipped';
  language: string;
}

/**
 * A Callable Cloud Function to resolve an AI task as either 'completed' or 'skipped'.
 * If 'completed', it rewards the user with stakes inside a transaction.
 * If 'skipped', it simply updates the task status.
 *
 * @param {IResolveTaskRequestData} data - The IResolveTaskRequestData from the client.
 * @param {any} context - The context of the call, including auth info.
 * @return {Promise<{ success: boolean; newBalance?: number }>} An object confirming the success and the user's new balance if applicable.
 */
const updateAiTasksStatusHandler = async (
  data: IResolveTaskRequestData,
  context: functions.https.CallableContext,
): Promise<{ success: boolean; newBalance?: number }> => {
  const t = getTranslation(data.language);

  // 1. --- AUTHENTICATION & VALIDATION ---
  if (!context.auth) {
    throwHttpsError('unauthenticated', t.common.noUserFound);
  }
  const userId = context.auth.uid;

  if (!data.taskId || !data.status || !data.language) {
    throwHttpsError(
      'invalid-argument',
      "The 'taskId', 'status', and 'language' fields are required.",
    );
  }
  if (data.status !== 'completed' && data.status !== 'skipped') {
    throwHttpsError(
      'invalid-argument',
      "Status must be 'completed' or 'skipped'.",
    );
  }

  const { taskId, status } = data;
  functions.logger.info(
    `User ${userId} is resolving task ${taskId} with status: ${status}.`,
  );

  const userDocRef = db.collection('users').doc(userId);
  const taskDocRef = userDocRef.collection('aiTasks').doc(taskId);

  // --- CASE 1: TASK IS COMPLETED (TRANSACTION IS ESSENTIAL) ---
  if (status === 'completed') {
    const REWARD_AMOUNT = 150;
    try {
      const newBalance = await db.runTransaction(async (transaction) => {
        // =======================================================
        // ALL READS MUST BE AT THE TOP OF THE TRANSACTION
        // =======================================================
        const taskDoc = await transaction.get(taskDocRef);
        const userDoc = await transaction.get(userDocRef); // <-- MOVED THIS READ UP

        // --- Perform validation on the read data ---
        if (!taskDoc.exists) {
          // It's better to throw a standard Error here and let the catch block handle it
          throw new Error('Task not found');
        }
        if (taskDoc.data()?.status !== 'active') {
          throw new Error('Task is not active anymore');
        }
        if (!userDoc.exists) {
          throw new Error('User document not found');
        }

        // =======================================================
        // ALL WRITES HAPPEN AFTER THE READS
        // =======================================================
        transaction.update(taskDocRef, {
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        transaction.update(userDocRef, {
          'gamification.currentStreak':
            admin.firestore.FieldValue.increment(REWARD_AMOUNT),
          activeAiTask: null, // Also clear the active task
        });

        // --- Return the calculated new balance ---
        // You can now use the data you already read at the top
        const currentBalance = userDoc.data()?.gamification.currentStreak || 0;
        return currentBalance + REWARD_AMOUNT;
      });

      functions.logger.info(
        `Task ${taskId} completed. New balance: ${newBalance}`,
      );
      return { success: true, newBalance: newBalance };
    } catch (error: any) {
      functions.logger.error(
        `Transaction to complete task ${taskId} failed:`,
        error,
      );
      // Let your helper handle converting the error to an HttpsError
      throwHttpsError(
        'internal',
        error.message || 'Could not complete the task.',
      );
    }
  }

  // --- CASE 2: TASK IS SKIPPED ---
  if (status === 'skipped') {
    try {
      // A batch write is good practice here to ensure both updates succeed or fail together.
      await taskDocRef.update({ status: 'skipped' });

      functions.logger.info(`Task ${taskId} was skipped by user ${userId}.`);
      return { success: true };
    } catch (error) {
      functions.logger.error(`Failed to skip task ${taskId}:`, error);
      throwHttpsError('internal', 'Could not update the task status.');
    }
  }

  // Fallback, should never be reached
  throwHttpsError('internal', 'Unhandled task status.');
};

// --- Type Definition for the data sent from the client ---
interface UpdateTaskNotesRequest {
  taskId: string;
  notes: string;
}

/**
 * A Callable Cloud Function that allows a user to add or update a 'notes' field
 * on a specific document in their `aiTasks` subcollection.
 */
const updateAiTaskNotesHandler = async (
  data: UpdateTaskNotesRequest,
  context: functions.https.CallableContext,
) => {
  // 1. --- AUTHENTICATION & VALIDATION ---
  if (!context.auth) {
    throwHttpsError(
      'unauthenticated',
      'You must be authenticated to update a task',
    );
  }

  const { taskId, notes } = data;
  const userId = context.auth.uid;

  if (!taskId || typeof taskId !== 'string') {
    throwHttpsError('invalid-argument', "A valid 'taskId' must be provided.");
  }

  // `notes` can be an empty string to clear it, but it must be a string.
  if (typeof notes !== 'string') {
    throwHttpsError('invalid-argument', "The 'notes' field must be a string.");
  }

  // Optional: Add a character limit to prevent abuse
  if (notes.length > 500) {
    throwHttpsError('invalid-argument', 'Notes cannot exceed 500 characters.');
  }

  functions.logger.info(`User ${userId} is updating notes for task ${taskId}.`);

  // 2. --- SECURE DOCUMENT REFERENCE ---
  // Construct the path directly using the authenticated userId to ensure
  // a user can only ever access their own tasks.
  const taskDocRef = db
    .collection('users')
    .doc(userId)
    .collection('aiTasks')
    .doc(taskId);

  // 3. --- DATABASE UPDATE ---
  try {
    // It's good practice to check if the document exists first,
    // though `update` would also fail. This gives a better error message.
    const docSnapshot = await taskDocRef.get();
    if (!docSnapshot.exists) {
      throwHttpsError('not-found', 'The specified task could not be found.');
    }

    // Perform the update. This will add the 'notes' field if it doesn't exist,
    // or overwrite it if it does.
    await taskDocRef.update({
      notes: notes,
    });

    functions.logger.log(`Successfully updated notes for task ${taskId}.`);

    // 4. --- RETURN SUCCESS RESPONSE ---
    return { success: true, message: 'Notes updated successfully.' };
  } catch (error) {
    // If the error is already an HttpsError we threw, re-throw it.
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    // Otherwise, log the unexpected error and throw a generic internal error.
    functions.logger.error(
      `Error updating task ${taskId} for user ${userId}:`,
      error,
    );
    throwHttpsError(
      'internal',
      'An unexpected error occurred while saving your notes.',
    );
  }
};

export {
  createAiTasksHandler,
  getAiTasksForDay,
  updateAiTaskNotesHandler,
  updateAiTasksStatusHandler,
};
