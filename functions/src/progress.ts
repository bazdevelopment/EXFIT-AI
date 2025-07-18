import {
  differenceInDays,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
// Import the necessary timezone conversion function
import { toZonedTime } from 'date-fns-tz';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Initialize Firestore if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Fetches progress analytics for a user, with all date/time calculations
 * performed relative to the user's specific timezone.
 *
 * @param {any} data - The request data (currently unused, but can be extended).
 * @param {functions.https.CallableContext} context - The context of the callable function,
 * containing authentication information.
 * @return {Promise<object>} An object containing various timezone-aware analytics data points.
 * @throws {functions.https.HttpsError} If the user is unauthenticated or user data is not found.
 */
const getProgressAnalyticsHandler = async (
  data: any,
  context: functions.https.CallableContext,
) => {
  // 1. --- AUTHENTICATION & SETUP ---
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to view progress.',
    );
  }
  const userId = context.auth.uid;
  functions.logger.info(`Fetching progress analytics for user: ${userId}`);

  // 2. --- INITIAL DATA FETCH ---
  const oneYearAgo = subMonths(new Date(), 12);

  const userDocPromise = db.collection('users').doc(userId).get();
  const logsSnapshotPromise = db
    .collection('users')
    .doc(userId)
    .collection('activityLogs')
    .where('date', '>=', admin.firestore.Timestamp.fromDate(oneYearAgo))
    .where('status', '==', 'attended')
    .orderBy('date', 'asc')
    .get();

  const [userDoc, logsSnapshot] = await Promise.all([
    userDocPromise,
    logsSnapshotPromise,
  ]);

  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User data not found.');
  }

  const userData = userDoc.data();
  // --- CRITICAL: Get the user's timezone. Default to UTC as a safe fallback. ---
  const userTimezone = userData?.timezone || 'UTC';
  const gamification = userData?.gamification || {};

  // --- Establish "today" from the user's perspective for calculations ---
  const todayInUserTz = toZonedTime(new Date(), userTimezone);

  // 3. --- ENHANCED DATA AGGREGATION ---

  const kpis = {
    currentStreak: gamification.currentStreak || 0,
    longestStreak: gamification.longestStreak || 0,
    totalXp: gamification.xpTotal || 0,
    gemsBalance: gamification.gemsBalance || 0,
    totalActivities: 0,
    averageXpPerDay: 0,
    weeklyGoalProgress: 0,
    monthlyGoalProgress: 0,
  };

  const weeklyXpData = new Map<string, number>();
  const activityFocusData = new Map<string, number>();
  const calendarData: { [date: string]: any } = {};
  const streakHistory: { value: number; date: string }[] = [];
  const monthlyActivityData = new Map<string, number>();
  const hourlyActivityData = new Map<number, number>();
  const xpProgressData: { value: number; date: string }[] = [];
  const activityTypeXpData = new Map<string, number>();
  const weeklyComparisonData = new Map<
    string,
    { thisWeek: number; lastWeek: number }
  >();
  const monthlyXpData = new Map<string, number>();

  const performanceMetrics = {
    bestDay: { date: '', xp: 0, activities: 0 },
    mostActiveHour: { hour: 0, count: 0 },
    averageSessionDuration: 0,
    totalDuration: 0,
    sessionCount: 0,
  };

  let currentStreakInHistory = 0;
  let lastDateInHistory: Date | null = null;
  let totalXpThisWeek = 0;
  let totalXpLastWeek = 0;
  let totalDurationMinutes = 0;
  let sessionCount = 0;

  const options = { weekStartsOn: 1 } as const; // Monday
  const thisWeekStart = startOfWeek(todayInUserTz, options);
  const lastWeekStart = startOfWeek(subDays(todayInUserTz, 7), options);
  const lastWeekEnd = endOfWeek(subDays(todayInUserTz, 7), options);

  logsSnapshot.forEach((doc) => {
    const log = doc.data();
    if (!log.date) return;

    // --- TIMEZONE-AWARE: Convert UTC timestamps for local calculations ---
    const logDateUtc = log.date.toDate();
    const logDateInUserTz = toZonedTime(logDateUtc, userTimezone);
    const logCreatedDateInUserTz = toZonedTime(
      log.createdAt.toDate(),
      userTimezone,
    );

    const dateString = format(logDateInUserTz, 'yyyy-MM-dd');
    const xpEarned = log.xpEarned || 0;
    const duration = log.durationMinutes || 0;
    const activityType = log.activityName || 'unknown';

    kpis.totalActivities++;

    const dayXp = (calendarData[dateString]?.xp || 0) + xpEarned;
    calendarData[dateString] = {
      marked: true,
      dotColor: dayXp > 50 ? '#10b981' : dayXp > 25 ? '#f59e0b' : '#6b7280',
      activeOpacity: Math.min(dayXp / 100, 1),
      xp: dayXp,
      activities: (calendarData[dateString]?.activities || 0) + 1,
    };

    if (logDateUtc >= thisWeekStart) {
      totalXpThisWeek += xpEarned;
      const dayLabel = format(logDateInUserTz, 'eee');
      weeklyComparisonData.set(dayLabel, {
        thisWeek:
          (weeklyComparisonData.get(dayLabel)?.thisWeek || 0) + xpEarned,
        lastWeek: weeklyComparisonData.get(dayLabel)?.lastWeek || 0,
      });
    }

    if (logDateUtc >= lastWeekStart && logDateUtc <= lastWeekEnd) {
      totalXpLastWeek += xpEarned;
      const dayLabel = format(logDateInUserTz, 'eee');
      weeklyComparisonData.set(dayLabel, {
        thisWeek: weeklyComparisonData.get(dayLabel)?.thisWeek || 0,
        lastWeek:
          (weeklyComparisonData.get(dayLabel)?.lastWeek || 0) + xpEarned,
      });
    }

    if (logDateUtc >= subDays(todayInUserTz, 6)) {
      const dayLabel = format(logDateInUserTz, 'eee');
      weeklyXpData.set(dayLabel, (weeklyXpData.get(dayLabel) || 0) + xpEarned);
    }

    activityFocusData.set(
      activityType,
      (activityFocusData.get(activityType) || 0) + 1,
    );
    activityTypeXpData.set(
      activityType,
      (activityTypeXpData.get(activityType) || 0) + xpEarned,
    );

    // --- TIMEZONE-AWARE: Use the user's local hour ---
    const hour = logCreatedDateInUserTz.getHours();
    hourlyActivityData.set(hour, (hourlyActivityData.get(hour) || 0) + 1);

    if (logDateUtc >= subDays(todayInUserTz, 30)) {
      xpProgressData.push({ value: xpEarned, date: dateString });
    }

    if (logDateUtc >= subMonths(todayInUserTz, 5)) {
      const monthLabel = format(logDateInUserTz, 'MMM');
      monthlyActivityData.set(
        monthLabel,
        (monthlyActivityData.get(monthLabel) || 0) + 1,
      );
      monthlyXpData.set(
        monthLabel,
        (monthlyXpData.get(monthLabel) || 0) + xpEarned,
      );
    }

    if (dayXp > performanceMetrics.bestDay.xp) {
      performanceMetrics.bestDay = {
        date: dateString,
        xp: dayXp,
        activities: calendarData[dateString].activities,
      };
    }

    if (duration > 0) {
      totalDurationMinutes += duration;
      sessionCount++;
    }

    // --- Streak calculation uses absolute time differences (robust) ---
    if (lastDateInHistory) {
      const diffInDays = differenceInDays(logDateUtc, lastDateInHistory);
      if (diffInDays > 1) {
        streakHistory.push({
          value: currentStreakInHistory,
          date: format(
            toZonedTime(lastDateInHistory, userTimezone),
            'yyyy-MM-dd',
          ),
        });
        currentStreakInHistory = 1;
      } else if (diffInDays === 1) {
        currentStreakInHistory++;
      }
    } else {
      currentStreakInHistory = 1;
    }
    lastDateInHistory = logDateUtc;
  });

  if (lastDateInHistory) {
    streakHistory.push({
      value: currentStreakInHistory,
      date: format(toZonedTime(lastDateInHistory, userTimezone), 'yyyy-MM-dd'),
    });
  }

  kpis.averageXpPerDay =
    kpis.totalActivities > 0
      ? Math.round(
          kpis.totalXp /
            Math.max(differenceInDays(todayInUserTz, oneYearAgo), 1),
        )
      : 0;
  kpis.weeklyGoalProgress = Math.min((totalXpThisWeek / 500) * 100, 100);
  kpis.monthlyGoalProgress = Math.min(
    (Array.from(monthlyXpData.values()).reduce((a, b) => a + b, 0) / 2000) *
      100,
    100,
  );

  performanceMetrics.averageSessionDuration =
    sessionCount > 0 ? Math.round(totalDurationMinutes / sessionCount) : 0;
  performanceMetrics.totalDuration = totalDurationMinutes;
  performanceMetrics.sessionCount = sessionCount;

  let maxHourCount = 0;
  let mostActiveHour = 0;
  hourlyActivityData.forEach((count, hour) => {
    if (count > maxHourCount) {
      maxHourCount = count;
      mostActiveHour = hour;
    }
  });
  performanceMetrics.mostActiveHour = {
    hour: mostActiveHour,
    count: maxHourCount,
  };

  // 4. --- FORMAT DATA FOR FRONTEND ---

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const formattedWeeklyXp = daysOfWeek.map((day) => ({
    value: weeklyXpData.get(day) || 0,
    label: day,
    frontColor: weeklyXpData.get(day) ? '#6366f1' : '#e5e7eb',
  }));

  const pieColors = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#0891b2',
    '#ec4899',
    '#8b5cf6',
    '#f97316',
  ];
  const formattedActivityFocus = Array.from(activityFocusData.entries()).map(
    ([name, count], index) => ({
      value: count,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      color: pieColors[index % pieColors.length],
      text: `${Math.round((count / kpis.totalActivities) * 100)}%`,
      xp: activityTypeXpData.get(name) || 0,
    }),
  );

  const last6Months = Array.from({ length: 6 }, (_, i) =>
    format(subMonths(todayInUserTz, 5 - i), 'MMM'),
  );
  const formattedMonthlyActivity = last6Months.map((month) => ({
    value: monthlyActivityData.get(month) || 0,
    label: month,
    frontColor: monthlyActivityData.get(month) ? '#10b981' : '#e5e7eb',
  }));
  const formattedMonthlyXp = last6Months.map((month) => ({
    value: monthlyXpData.get(month) || 0,
    label: month,
    frontColor: monthlyXpData.get(month) ? '#6366f1' : '#e5e7eb',
  }));

  const formattedHourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
    value: hourlyActivityData.get(hour) || 0,
    label: `${hour}:00`,
    frontColor: hourlyActivityData.get(hour) ? '#8b5cf6' : '#e5e7eb',
  }));

  const formattedWeeklyComparison = daysOfWeek.map((day) => ({
    label: day,
    thisWeek: weeklyComparisonData.get(day)?.thisWeek || 0,
    lastWeek: weeklyComparisonData.get(day)?.lastWeek || 0,
  }));
  // 5. --- RETURN ENHANCED PAYLOAD ---
  return {
    kpis,
    calendarData,
    weeklyXpChartData: formattedWeeklyXp,
    activityPieChartData: formattedActivityFocus,
    streakHistoryChartData: streakHistory,
    monthlyActivityChartData: formattedMonthlyActivity,
    monthlyXpChartData: formattedMonthlyXp,
    hourlyActivityChartData: formattedHourlyActivity,
    weeklyComparisonChartData: formattedWeeklyComparison,
    xpProgressChartData: xpProgressData,
    performanceMetrics,
    insights: {
      weeklyXpChange:
        totalXpLastWeek > 0
          ? ((totalXpThisWeek - totalXpLastWeek) / totalXpLastWeek) * 100
          : 0,
      mostProductiveHour: `${mostActiveHour}:00`,
      favoriteActivity:
        Array.from(activityFocusData.entries()).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0] || 'none',
      consistencyScore: Math.min((streakHistory.length / 52) * 100, 100),
    },
    detailedStats: {
      longestStreak: gamification.longestStreak || 0,
      totalMinutesActive: totalDurationMinutes,
      averageSessionDuration: performanceMetrics.averageSessionDuration,
      physicalActivitiesThisMonth: Array.from(
        monthlyActivityData.values(),
      ).reduce((a, b) => a + b, 0),
      bestPerformanceDay: performanceMetrics.bestDay,
    },
  };
};

// Export the handler for deployment
export { getProgressAnalyticsHandler };
