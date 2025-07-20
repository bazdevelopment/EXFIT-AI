import * as functions from 'firebase-functions/v1';

import { throwHttpsError } from '../utilities/errors';
import { admin } from './common';

// --- Define the structure of our source data for clarity ---
interface IShopItem {
  id: string;
  name: string;
  costInGems: number;
  category: string;
  type: 'consumable' | 'permanent_unlock';
  description: string;
  isDisabled: boolean;
  imageUrl: string;
}

interface IPurchasedShopItem extends IShopItem {
  quantity: number;
}

// --- SHOP ITEMS DATA ---
const shopItemsToSeed: IShopItem[] = [
  {
    id: 'STREAK_FREEZE_POTION',
    name: 'Streak Freeze Potion',
    costInGems: 300,
    category: 'potion',
    imageUrl: '',
    type: 'consumable',
    description:
      'Protects your streak for one day of inactivity. You can hold multiple.',
    isDisabled: false,
  },
  {
    id: 'STREAK_REVIVAL_ELIXIR',
    name: 'Streak Revival Elixir',
    costInGems: 800,
    category: 'potion',
    imageUrl: '',
    type: 'consumable',
    description:
      'Lost your streak in the last 48 hours? Use this to bring it back!',
    isDisabled: false,
  },
  {
    id: 'AI_WISDOM_BOOST',
    name: 'AI Wisdom Boost',
    costInGems: 400,
    category: 'boost',
    type: 'consumable',
    imageUrl: '',
    description:
      'Get an extra, in-depth tip from the AI Coach after your next workout.',
    isDisabled: false,
  },
  {
    id: 'TIME_TURNER',
    name: 'Time Turner',
    costInGems: 500,
    category: 'utility',
    imageUrl: '',
    type: 'consumable',
    description:
      'Extends the deadline for your daily goal by 3 hours. Use it before midnight!',
    isDisabled: true,
  },
  {
    id: 'MOTIVATION_DROP',
    name: 'Motivation Drop',
    costInGems: 300,
    category: 'boost',
    type: 'consumable',
    imageUrl: '',
    description:
      'Get an instant, powerful motivational quote from our AI tailored to your goals.',
    isDisabled: false,
  },
  {
    id: 'RECOVERY_KIT',
    name: 'Recovery Kit',
    costInGems: 1000,
    category: 'utility',
    type: 'permanent_unlock',
    imageUrl: '',
    description:
      'Permanently unlocks the advanced "AI Post-Activity Recovery" feature.',
    isDisabled: true,
  },
  {
    id: 'MYSTERY_BOX',
    name: 'Mystery Box',
    costInGems: 1200,
    category: 'mystery',
    imageUrl: '',
    type: 'consumable',
    description:
      'Contains a random assortment of gems, XP, or even a rare item!',
    isDisabled: true,
  },
];

/**
 * A one-time callable function to seed the `shopItems` collection in Firestore.
 * @param {any} data - The data passed to the callable function.
 * @param {functions.https.CallableContext} context - The callable function context, including authentication info.
 */

const db = admin.firestore();
const bucket = admin.storage().bucket();

const seedShopItemsHandler = async (
  data: any,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throwHttpsError(
      'unauthenticated',
      'The function must be called while authenticated',
    );
  }

  functions.logger.info('Starting to seed shop items...');

  try {
    // Generate signed URLs for each item
    const itemsWithImageUrls = await Promise.all(
      shopItemsToSeed.map(async (item) => {
        const fileName = `shop-items/${item.id}.png`;
        const file = bucket.file(fileName);

        try {
          // Make the file publicly accessible
          await file.makePublic();

          // Generate the public URL
          const publicUrl = file.publicUrl();

          return {
            ...item,
            imageUrl: publicUrl,
          };
        } catch (error) {
          functions.logger.warn(
            `Failed to generate signed URL for ${fileName}, using empty string`,
          );
          return item; // Keep original item with empty imageUrl
        }
      }),
    );

    // Save items to Firestore
    await Promise.all(
      itemsWithImageUrls.map((item) =>
        db.collection('shopItems').doc(item.id).set(item),
      ),
    );

    const message = `Successfully seeded ${itemsWithImageUrls.length} items to the 'shopItems' collection.`;
    functions.logger.info(message);
    return { success: true, message };
  } catch (error) {
    functions.logger.error('Error seeding shop items:', error);
    throwHttpsError('internal', 'Failed to seed shop items.');
  }
};

/**
 * Get shop items from Firestore with optional filtering
 * @param {any} data - The data passed to the callable function (e.g., { includeDisabled: boolean }).
 * @param {functions.https.CallableContext} context - The callable function context, including authentication info.
 */
const getShopItemsHandler = async (
  data: any,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throwHttpsError(
      'unauthenticated',
      'The function must be called while authenticated',
    );
  }

  functions.logger.info('Fetching shop items...');

  try {
    // You can add query parameters like: { includeDisabled: true }
    const includeDisabled = data?.includeDisabled || true;

    let query: FirebaseFirestore.Query = db.collection('shopItems');

    // Filter out disabled items unless explicitly requested
    if (!includeDisabled) {
      query = query.where('isDisabled', '==', false);
    }

    const snapshot = await query.get();

    const shopItems: IShopItem[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as IShopItem,
    );

    // Sort items: available items first (by price ascending), then disabled items (by price ascending)
    const sortedItems = shopItems.sort((a, b) => {
      // First sort by availability (enabled items first)
      if (a.isDisabled !== b.isDisabled) {
        return a.isDisabled ? 1 : -1;
      }
      // Then sort by price in ascending order
      return a.costInGems - b.costInGems;
    });

    functions.logger.info(
      `Successfully fetched ${sortedItems.length} shop items`,
    );
    return { success: true, items: sortedItems };
  } catch (error) {
    functions.logger.error('Error fetching shop items:', error);
    throwHttpsError('internal', 'Failed to fetch shop items.');
  }
};

// ... (other functions and initialization)

interface PurchaseRequestData {
  itemId: string; // The ID of the item from the `shopItems` collection
  quantity: number;
}

/**
 * A Callable Function to allow a user to purchase an item from the shop.
 * It atomically verifies the user's gem balance, decrements it, and adds the
 * item to the user's inventory (`ownedItems` subcollection).
 * @param {PurchaseRequestData} data - The purchase request data containing itemId and quantity.
 * @param {functions.https.CallableContext} context - The callable function context, including authentication info.
 */
const purchaseShopItemHandler = async (
  data: PurchaseRequestData,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throwHttpsError(
      'unauthenticated',
      'You must be authenticated to make a purchase.',
    );
  }

  const { itemId, quantity } = data;
  const userId = context.auth.uid;

  if (!itemId || !quantity || quantity <= 0) {
    throwHttpsError('invalid-argument', 'ID and a valid quantity are required');
  }

  const itemRef = db.collection('shopItems').doc(itemId);
  const userRef = db.collection('users').doc(userId);
  const userItemRef = userRef.collection('ownedItems').doc(itemId); // Use item ID for easy lookups
  // Use a Firestore Transaction to ensure the entire operation is atomic.
  return db.runTransaction(async (transaction) => {
    // 1. Get all necessary documents first.
    const itemDoc = await transaction.get(itemRef);
    const userDoc = await transaction.get(userRef);

    // 2. Perform all validation checks.
    if (!itemDoc.exists) {
      throwHttpsError('not-found', 'Sorry, this item does not exist.');
    }
    const itemData = itemDoc.data()!;

    if (itemData.isDisabled) {
      throwHttpsError(
        'failed-precondition',
        'This item is currently unavailable.',
      );
    }

    const totalCost = itemData.costInGems * quantity;
    const currentGems = userDoc.data()?.gamification?.gemsBalance ?? 0;

    if (currentGems < totalCost) {
      throwHttpsError(
        'failed-precondition',
        'You do not have enough gems for this purchase.',
      );
    }

    // 3. If all checks pass, perform the database writes.
    // a. Decrement the user's gem balance.
    transaction.update(userRef, {
      'gamification.gemsBalance':
        admin.firestore.FieldValue.increment(-totalCost),
    });

    // b. Add or update the item in the user's inventory.
    transaction.set(
      userItemRef,
      {
        shopItemId: itemId,
        quantity: admin.firestore.FieldValue.increment(quantity), // Safely increment the quantity
        purchasedAt: admin.firestore.FieldValue.serverTimestamp(), // Set purchase date on first buy
      },
      { merge: true },
    ); // Use merge:true to create or update the document
    transaction.update(userRef, {
      'gamification.streakFreezes': admin.firestore.FieldValue.increment(1),
    });

    return {
      success: true,
      message: `Successfully purchased ${itemData.name}!`,
    };
  });
};

/**
 * A Callable Function that fetches all items owned by the currently authenticated user.
 * It enriches the user's inventory data with the full details from the main
 * `shopItems` collection, providing a UI-ready list.
 * @param {any} data - The data passed to the callable function (not used).
 * @param {functions.https.CallableContext} context - The callable function context, including authentication info.
 */
const getPurchasedItemsHandler = async (
  data: any,
  context: functions.https.CallableContext,
) => {
  // 1. --- AUTHENTICATION ---
  if (!context.auth) {
    throwHttpsError(
      'unauthenticated',
      'You must be authenticated to view your items.',
    );
  }
  const userId = context.auth.uid;
  functions.logger.info(`Fetching owned items for user: ${userId}`);

  // 2. --- FETCH USER'S INVENTORY ---
  const ownedItemsSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('ownedItems')
    .get();

  if (ownedItemsSnapshot.empty) {
    functions.logger.info(`User ${userId} has no owned items.`);
    return { items: [] }; // Return an empty array if they own nothing
  }

  // 3. --- PREPARE TO FETCH FULL ITEM DETAILS ---
  // Create an array of all the shop item IDs the user owns.
  const ownedItemIds = ownedItemsSnapshot.docs.map(
    (doc) => doc.data().shopItemId,
  );

  // Use Firestore's 'in' query to fetch all corresponding documents
  // from the main `shopItems` collection in a single, efficient query.
  // Note: The 'in' query is limited to 30 items. If a user could own more,
  // you would need to batch these requests. For a shop, 30 is a reasonable limit.
  if (ownedItemIds.length > 30) {
    // Handle the edge case of more than 30 unique items, though unlikely
    // You would split ownedItemIds into chunks of 30 and run multiple queries.
    functions.logger.warn(
      `User ${userId} owns more than 30 unique items. Truncating for this query.`,
    );
  }
  const shopItemsSnapshot = await db
    .collection('shopItems')
    .where(
      admin.firestore.FieldPath.documentId(),
      'in',
      ownedItemIds.slice(0, 30),
    )
    .get();

  // Create a quick-lookup map of the full shop item details.
  const shopItemsMap = new Map();
  shopItemsSnapshot.forEach((doc) => {
    shopItemsMap.set(doc.id, doc.data());
  });

  // 4. --- "JOIN" AND ENRICH THE DATA ---
  // Loop through the user's owned items and combine them with the full details.
  const enrichedItems: IPurchasedShopItem[] = [];
  ownedItemsSnapshot.forEach((doc) => {
    const ownedItem = doc.data();
    const shopItemDetails = shopItemsMap.get(ownedItem.shopItemId);
    // Only add the item if its details were found in the main shop collection
    // This prevents showing items that may have been deleted from the shop.
    if (shopItemDetails) {
      enrichedItems.push({
        id: ownedItem.shopItemId,
        name: shopItemDetails.name,
        description: shopItemDetails.description,
        imageUrl: shopItemDetails.imageUrl,
        category: shopItemDetails.category,
        type: shopItemDetails.type,
        quantity: ownedItem.quantity, // Get the quantity from the user's inventory
        costInGems: shopItemDetails.costInGems,
        isDisabled: shopItemDetails.isDisabled,
      });
    }
  });

  functions.logger.info(
    `Returning ${enrichedItems.length} enriched items for user ${userId}.`,
  );

  // 5. --- RETURN THE FINAL, UI-READY ARRAY ---
  return { items: enrichedItems };
};

/**
 * A Callable Function that allows a user to repair their most recently broken streak.
 * It requires a "Streak Revival Elixir" and must be used within a 48-hour window.
 * @param {any} data - The data passed to the callable function (not used).
 * @param {functions.https.CallableContext} context - The callable function context, including authentication info.
 * @return {Promise<{success: boolean, message: string}>} Result of the streak repair operation.
 */
export const repairStreakHandler = (
  data: any,
  context: functions.https.CallableContext,
) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated.',
    );
  }
  const userId = context.auth.uid;

  const userRef = db.collection('users').doc(userId);
  // The ID for the elixir item in the user's inventory
  const elixirRef = userRef
    .collection('ownedItems')
    .doc('STREAK_REVIVAL_ELIXIR');

  // Use a transaction to ensure all checks and writes are atomic
  return db.runTransaction(async (transaction) => {
    // 1. --- READ all necessary documents first ---
    const userDoc = await transaction.get(userRef);
    const elixirDoc = await transaction.get(elixirRef);

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User data not found.');
    }

    const gamification = userDoc.data()?.gamification || {};
    const now = new Date();

    // 2. --- PERFORM ALL VALIDATION CHECKS (THE "GATES") ---

    // GATE 1: Check if the user owns an elixir.
    if (!elixirDoc.exists || elixirDoc.data()?.quantity < 1) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You do not have a Streak Revival Elixir to use.',
      );
    }

    // GATE 2: Check if the user is in a "repairable" state.
    const lostStreakValue = gamification.lostStreakValue;
    const lostStreakTimestamp =
      gamification.lostStreakTimestamp as admin.firestore.Timestamp;

    if (!lostStreakValue || !lostStreakTimestamp || lostStreakValue <= 0) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You already repaired your streak over the last 48 hour.',
      );
    }

    const lostStreakTimestampDate = new Date(lostStreakTimestamp as any); // need to convert to new Date
    // GATE 3: Check if the action is within the time limit (e.g., 48 hours).
    const hoursSinceLost =
      (now.getTime() - lostStreakTimestampDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLost > 48) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The 48-hour window to repair your streak has expired.',
      );
    }

    // 3. --- IF ALL CHECKS PASS, PERFORM THE ACTIONS ---

    // a. Restore the streak and set last activity date to "yesterday"
    //    to prevent it from breaking again immediately.
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayTimestamp = admin.firestore.Timestamp.fromDate(yesterday);

    const userUpdates = {
      'gamification.currentStreak': lostStreakValue,
      'gamification.lastActivityDate': yesterdayTimestamp, // Critical UX improvement!
      // b. Clean up the state to prevent reuse.
      'gamification.lostStreakValue': admin.firestore.FieldValue.delete(),
      'gamification.lostStreakTimestamp': admin.firestore.FieldValue.delete(),
      'gamification.streakRepairDates': admin.firestore.FieldValue.arrayUnion(
        new Date().toISOString(),
      ),
    };
    transaction.update(userRef, userUpdates);

    // c. Consume the elixir.
    transaction.update(elixirRef, {
      quantity: admin.firestore.FieldValue.increment(-1),
    });

    return {
      success: true,
      message: `Congratulations! Your ${lostStreakValue}-day streak is officially restored. You're on track—let's keep it rolling!`,
    };
  });
};
export {
  getPurchasedItemsHandler,
  getShopItemsHandler,
  purchaseShopItemHandler,
  seedShopItemsHandler,
};
