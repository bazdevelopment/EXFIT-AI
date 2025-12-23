/* eslint-disable valid-jsdoc */
/**
 * Add to users/{userId} document:
 */
// const userMacroGoals = {
//   macroGoals: {
//     calories: 2000,
//     protein: 150,
//     carbs: 200,
//     fat: 65,
//   },
// };

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

import { generateUniqueId } from '../utilities/generate-unique-id';

const db = admin.firestore();

/**
 * Collection: users/{userId}/macroLogs/{date}
 * Document ID format: YYYY-MM-DD (e.g., "2024-12-21")
 */
// const macroLogSchema = {
//   date: '2024-12-21',
//   userId: 'string',

//   // Array of meals for the day
//   meals: [
//     {
//       id: 'meal_1734789123456_abc123',
//       label: 'Roasted Chicken with Potatoes and Veggies',
//       calories: 770,
//       protein: 56,
//       carbs: 73,
//       fat: 29,
//       timestamp: 'firestore_timestamp',
//       source: 'manual', // "manual" or "chat"
//     },
//   ],

//   // Daily totals (auto-calculated from meals)
//   totals: {
//     calories: 770,
//     protein: 56,
//     carbs: 73,
//     fat: 29,
//   },

//   // Progress percentages (compared to goals)
//   progress: {
//     calories: 38.5, // (770 / 2000) * 100
//     protein: 37.3, // (56 / 150) * 100
//     carbs: 36.5, // (73 / 200) * 100
//     fat: 44.6, // (29 / 65) * 100
//   },

//   mealsCount: 1,
//   lastUpdated: 'firestore_timestamp',
//   createdAt: 'firestore_timestamp',
// };

// ==============================================
// TYPES
// ==============================================

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// interface MacroProgress {
//   calories: number;
//   protein: number;
//   carbs: number;
//   fat: number;
// }

// interface MacroGoals {
//   calories: number;
//   protein: number;
//   carbs: number;
//   fat: number;
// }

interface Meal {
  id: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: admin.firestore.FieldValue;
  source: string;
}

interface AddMacroEntryData {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  source?: string;
}

interface UpdateMacroEntryData {
  date: string;
  mealId: string;
  label?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface DeleteMacroEntryData {
  date: string;
  mealId: string;
}

interface GetDailyMacrosData {
  date: string;
}

interface GetMacroDateRangeData {
  startDate: string;
  endDate: string;
}

// ==============================================
// FIREBASE CLOUD FUNCTIONS (index.js)
// ==============================================

/**
 * Calculate totals from meals array
 */
function calculateTotals(meals: Meal[]): MacroTotals {
  return meals.reduce(
    (acc: MacroTotals, meal: Meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/**
 * Calculate progress percentages
 */
// async function calculateProgress(
//   userId: string,
//   totals: MacroTotals,
// ): Promise<MacroProgress> {
//   const userDoc = await db.collection('users').doc(userId).get();
//   const goals: MacroGoals = userDoc.data()?.macroGoals;
//   console.log('Goals:', goals);
//   return {
//     calories: goals.calories
//       ? parseFloat(((totals.calories / goals.calories) * 100).toFixed(1))
//       : 0,
//     protein: goals.protein
//       ? parseFloat(((totals.protein / goals.protein) * 100).toFixed(1))
//       : 0,
//     carbs: goals.carbs
//       ? parseFloat(((totals.carbs / goals.carbs) * 100).toFixed(1))
//       : 0,
//     fat: goals.fat
//       ? parseFloat(((totals.fat / goals.fat) * 100).toFixed(1))
//       : 0,
//   };
// }

/**
 * Add Macro Entry
 * Accepts: { label, calories, protein, carbs, fat, date, source }
 */
export const addMacroEntryHandler = async (
  data: AddMacroEntryData,
  context: functions.https.CallableContext,
) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated',
    );
  }

  const userId = context.auth.uid;
  const {
    label,
    calories,
    protein,
    carbs,
    fat,
    date,
    source = 'manual',
  } = data;

  // Validate required fields
  if (
    !label ||
    calories === undefined ||
    protein === undefined ||
    carbs === undefined ||
    fat === undefined ||
    !date
  ) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: label, calories, protein, carbs, fat, date',
    );
  }

  try {
    const logRef = db
      .collection('users')
      .doc(userId)
      .collection('macroLogs')
      .doc(date);

    // Create new meal entry with a regular timestamp
    const newMeal: Meal = {
      id: generateUniqueId(),
      label,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      createdAt: admin.firestore.Timestamp.now(), // Changed: Use Timestamp.now() instead
      source,
    };

    // Get current document or create new one
    const logDoc = await logRef.get();
    let meals: Meal[] = [];

    if (logDoc.exists) {
      meals = logDoc.data()?.meals || [];
    }

    // Add new meal to array
    meals.push(newMeal);

    // Calculate new totals and progress
    // const totals = calculateTotals(meals);
    // const progress = await calculateProgress(userId, totals);

    // Update document
    await logRef.set({
      date,
      userId,
      meals,
      // totals,
      // progress,
      mealsCount: meals.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // This is fine at document level
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // This is fine at document level
    });

    return {
      success: true,
      mealId: newMeal.id,
      // totals,
      // progress,
      message: 'Macro entry added successfully',
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error adding macro entry:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
};
/**
 * Update Macro Entry
 * Accepts: { date, mealId, label?, calories?, protein?, carbs?, fat? }
 */
export const updateMacroEntryHandler = async (
  data: UpdateMacroEntryData,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated',
    );
  }

  const userId = context.auth.uid;
  const { date, mealId, label, calories, protein, carbs, fat } = data;

  if (!date || !mealId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Date and mealId are required',
    );
  }

  try {
    const logRef = db
      .collection('users')
      .doc(userId)
      .collection('macroLogs')
      .doc(date);
    const logDoc = await logRef.get();

    if (!logDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Log not found for this date',
      );
    }

    const meals: Meal[] = logDoc.data()?.meals || [];

    // Find and update the meal
    const mealIndex = meals.findIndex((m: Meal) => m.id === mealId);
    if (mealIndex === -1) {
      throw new functions.https.HttpsError('not-found', 'Meal not found');
    }

    // Update only provided fields
    if (label !== undefined) meals[mealIndex].label = label;
    if (calories !== undefined) meals[mealIndex].calories = Number(calories);
    if (protein !== undefined) meals[mealIndex].protein = Number(protein);
    if (carbs !== undefined) meals[mealIndex].carbs = Number(carbs);
    if (fat !== undefined) meals[mealIndex].fat = Number(fat);

    // Recalculate totals and progress
    const totals = calculateTotals(meals);
    // const progress = await calculateProgress(userId, totals);

    await logRef.update({
      meals,
      totals,
      // progress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      totals,
      // progress,
      message: 'Macro entry updated successfully',
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error updating macro entry:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
};

/**
 * Delete Macro Entry
 * Accepts: { date, mealId }
 */
export const deleteMacroEntryHandler = async (
  data: DeleteMacroEntryData,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated',
    );
  }

  const userId = context.auth.uid;
  const { date, mealId } = data;

  if (!date || !mealId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Date and mealId are required',
    );
  }

  try {
    const logRef = db
      .collection('users')
      .doc(userId)
      .collection('macroLogs')
      .doc(date);
    const logDoc = await logRef.get();

    if (!logDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Log not found for this date',
      );
    }

    let meals: Meal[] = logDoc.data()?.meals || [];

    // Filter out the meal to delete
    meals = meals.filter((m: Meal) => m.id !== mealId);

    if (meals.length === 0) {
      // If no meals left, delete the entire document
      await logRef.delete();
      return {
        success: true,
        message: 'Last meal deleted, log removed',
      };
    }

    await logRef.update({
      meals,
      mealsCount: meals.length,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,

      message: 'Macro entry deleted successfully',
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error deleting macro entry:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
};

/**
 * Get Daily Macro Summary
 * Accepts: { date }
 */
export const getDailyMacrosHandler = async (
  data: GetDailyMacrosData,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated',
    );
  }

  const userId = context.auth.uid;
  const { date } = data;

  if (!date) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Date is required',
    );
  }

  try {
    const logRef = db
      .collection('users')
      .doc(userId)
      .collection('macroLogs')
      .doc(date);
    const logDoc = await logRef.get();
    const responseData = logDoc.data();
    const meals: Meal[] = logDoc.data()?.meals || [];

    const totals = calculateTotals(meals);
    if (!logDoc.exists) {
      return {
        success: true,
        data: null,
        message: 'No entries for this date',
      };
    }

    return {
      success: true,
      data: { ...responseData, totals },
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error getting daily macros:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
};

/**
 * Get Date Range (for weekly/monthly view)
 * Accepts: { startDate, endDate }
 */
export const getMacroDateRangeHandler = async (
  data: GetMacroDateRangeData,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated',
    );
  }

  const userId = context.auth.uid;
  const { startDate, endDate } = data;

  if (!startDate || !endDate) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Start and end dates are required',
    );
  }

  try {
    const logsRef = db.collection('users').doc(userId).collection('macroLogs');
    const snapshot = await logsRef
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();

    const logs = snapshot.docs.map((doc) => doc.data());

    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  } catch (error) {
    const err = error as Error;
    console.error('Error getting macro date range:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
};
