/*
=== LEVEL PROGRESSION TABLE ===

Here's how the first 10 levels work as examples:

Level | XP Needed | Total XP | Formula Calculation
------|-----------|----------|-------------------
  1   |    100    |   100    | 100 * (1.4^0) = 100 * 1 = 100
  2   |    140    |   240    | 100 * (1.4^1) = 100 * 1.4 = 140
  3   |    196    |   436    | 100 * (1.4^2) = 100 * 1.96 = 196  
  4   |    274    |   710    | 100 * (1.4^3) = 100 * 2.744 = 274
  5   |    384    |  1,094   | 100 * (1.4^4) = 100 * 3.8416 = 384
  6   |    537    |  1,631   | 100 * (1.4^5) = 100 * 5.378 = 537
  7   |    752    |  2,383   | 100 * (1.4^6) = 100 * 7.529 = 752
  8   |  1,053    |  3,436   | 100 * (1.4^7) = 100 * 10.541 = 1,053
  9   |  1,474    |  4,910   | 100 * (1.4^8) = 100 * 14.758 = 1,474
 10   |  2,064    |  6,974   | 100 * (1.4^9) = 100 * 20.661 = 2,064

=== REAL-WORLD EXAMPLES ===

User has 500 XP:
- They've passed Level 3 (436 total) but not Level 4 (710 total)
- Current Level: 3
- Progress in Level 3: 500 - 240 = 260 XP out of 274 needed
- XP to Level 4: 710 - 500 = 210 XP remaining

User has 1,500 XP:  
- They've passed Level 5 (1,094 total) but not Level 6 (1,631 total)
- Current Level: 5
- Progress in Level 5: 1,500 - 1,094 = 406 XP out of 537 needed
- XP to Level 6: 1,631 - 1,500 = 131 XP remaining

User has 50 XP:
- They haven't reached Level 1 yet (need 100 total)
- Current Level: 0 (pre-level state)
- XP to Level 1: 100 - 50 = 50 XP remaining
*/

// XP and Level System
const XP_LEVELS = (() => {
  const levels = [];
  let baseXP = 100;

  for (let level = 1; level <= 500; level++) {
    // XP requirement grows exponentially but with a controlled curve
    const xpRequired = Math.floor(baseXP * Math.pow(1.4, level - 1));
    levels.push({
      level,
      xpRequired, // XP needed to complete THIS level
      // TOTAL XP CALCULATION:
      // For level 1: just the xpRequired (100)
      // For level 2+: previous level's totalXP + current level's xpRequired
      //
      // Example progression:
      // Level 1: totalXP = 100 (need 100 total to reach level 1)
      // Level 2: totalXP = 100 + 140 = 240 (need 240 total to reach level 2)
      // Level 3: totalXP = 240 + 196 = 436 (need 436 total to reach level 3)
      totalXP:
        level === 1 ? xpRequired : levels[level - 2].totalXP + xpRequired,
    });
  }

  return levels;
})();

export const calculateLevel = (currentXP: number) => {
  // Handle edge case: user has 0 or negative XP
  if (currentXP < 0) currentXP = 0;

  // Find the highest level the user has achieved
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (currentXP >= XP_LEVELS[i].totalXP) {
      // User has reached this level
      const currentLevel = XP_LEVELS[i].level;
      const isMaxLevel = i === XP_LEVELS.length - 1;

      if (isMaxLevel) {
        return {
          currentLevel,
          currentLevelXP: XP_LEVELS[i].xpRequired, // Full XP for max level
          nextLevelXP: XP_LEVELS[i].xpRequired, // Same as current for max level
          xpToNextLevel: 0, // No more XP needed
          nextLevel: currentLevel, // Stay at max level
          totalXP: currentXP,
          isMaxLevel: true,
        };
      }

      // Calculate progress within current level
      const previousTotalXP = i > 0 ? XP_LEVELS[i - 1].totalXP : 0;
      const currentLevelXP = currentXP - previousTotalXP;
      const nextLevelXP = XP_LEVELS[i + 1].xpRequired;
      const nextLevelTotalXP = XP_LEVELS[i + 1].totalXP;
      return {
        currentLevel,
        currentLevelXP, // XP progress within current level
        nextLevelXP, // XP required for next level
        xpToNextLevel: nextLevelTotalXP - currentXP, // XP needed to reach next level
        nextLevel: XP_LEVELS[i + 1].level, // Next level number
        totalXP: currentXP,
        isMaxLevel: false,
      };
    }
  }

  // If user has less XP than level 1 requirement (Level 0 state)
  return {
    currentLevel: 0,
    currentLevelXP: currentXP, // Their current XP is their progress toward level 1
    nextLevelXP: XP_LEVELS[0].xpRequired, // XP required for level 1 (100)
    xpToNextLevel: XP_LEVELS[0].totalXP - currentXP, // XP needed to reach level 1
    nextLevel: 1,
    totalXP: currentXP,
    isMaxLevel: false,
  };
};
