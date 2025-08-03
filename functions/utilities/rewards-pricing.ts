// Define a simple type for a reward unit.
interface Reward {
  xp: number;
  gems: number;
  description: string;
}

// Define the keys for events that can grant rewards.
// Using a type makes it impossible to misspell an event name.
type EventRewardKey =
  | 'daily_checkin'
  | 'custom_ai_task'
  | 'custom_activity'
  | 'excuse_logged_daily_checkin'
  | 'permanent_account_creation';

// Define the keys for purchasable shop items.
type ShopItemKey =
  | 'STREAK_FREEZE_POTION'
  | 'STREAK_REVIVAL_ELIXIR'
  | 'XP_BOOST_2X_24H'
  | 'AI_WISDOM_BOOST'
  | 'AVATAR_OUTFIT_EPIC'
  | 'MYSTERY_BOX';

// Define the structure for a shop item's pricing.
interface ShopItemPrice {
  costInGems: number;
  description: string;
}

/**
 * The main interface for the entire gamification rewards configuration.
 * This should match the structure of your Firestore document.
 */
export interface GamificationRewardsConfig {
  /**
   * A map of base rewards for specific, loggable event types.
   * The key is the event name, and the value is the Reward object.
   */
  eventRewards: Record<EventRewardKey, Reward>;

  /**
   * A map of bonus rewards that can be stacked on top of base event rewards.
   * The key is the bonus name, and the value is the Reward object.
   */

  /**
   * A map defining the cost in Gems for all purchasable shop items.
   * The key is the item's unique identifier.
   */
  shopItems: Record<ShopItemKey, ShopItemPrice>;

  /**
   * An array of numbers representing the streak lengths that trigger a milestone bonus.
   */
  streakMilestones: number[];
}

export const GAMIFICATION_REWARDS_CONFIG: GamificationRewardsConfig = {
  /**
   * Base rewards earned for completing a specific type of activity.
   * All values are clean multiples of 5.
   */
  eventRewards: {
    // The absolute minimum for opening the app and checking in.
    daily_checkin: {
      xp: 30,
      gems: 25,
      description: 'Base reward for confirming any activity.',
    },
    custom_activity: {
      xp: 30,
      gems: 25,
      description: 'Reward for logging a custom activity.',
    },
    excuse_logged_daily_checkin: {
      xp: 15,
      gems: 5,
      description: 'Reward for logging an excuse in the daily check-in',
    },
    custom_ai_task: {
      xp: 25,
      gems: 20,
      description: 'Base reward for confirming any activity.',
    },
    permanent_account_creation: {
      xp: 60,
      gems: 50,
      description: 'Base reward for creating a permanent account.',
    },
  },

  /**
   * Shop item prices are now clean, memorable numbers.
   */
  shopItems: {
    // The cornerstone item. A clear goal for users.
    STREAK_FREEZE_POTION: {
      costInGems: 300, // A nice, round number
      description: 'Protects your streak for one day of inactivity.',
    },
    // A high-value, high-cost item that feels like a major investment.
    STREAK_REVIVAL_ELIXIR: {
      costInGems: 800,
      description: 'Lost a long streak? Use within 48 hours to restore it.',
    },
    // A powerful utility item.
    XP_BOOST_2X_24H: {
      costInGems: 450,
      description:
        'Doubles all XP you earn from activities for the next 24 hours.',
    },
    // A mid-tier "fun" purchase.
    AI_WISDOM_BOOST: {
      costInGems: 400,
      description:
        'Unlocks an exclusive, in-depth motivational story from the AI coach.',
    },
    // The ultimate long-term goal for dedicated users.
    AVATAR_OUTFIT_EPIC: {
      costInGems: 2000,
      description: 'An epic outfit for your AI Coach avatar.',
    },
    // A high-cost gamble.
    MYSTERY_BOX: {
      costInGems: 1200,
      description:
        'Contains a random amount of Gems (from 500 to 2000) or a rare item!',
    },
  },

  /**
   * The milestones for triggering the bonus remain the same.
   */
  streakMilestones: [7, 14, 21, 30, 50, 75, 100, 125, 150, 200, 250, 300, 365],
};
