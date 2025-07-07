/* eslint-disable max-lines-per-function */
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {} from 'nativewind';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { useProgressData } from '@/api/progress/progress.hooks';
import ScreenWrapper from '@/components/screen-wrapper';
import { colors, Text } from '@/components/ui';

const { width: screenWidth } = Dimensions.get('window');

// --- Enhanced UI Components ---

const AnimatedCard = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

const GradientCard = ({
  title,
  subtitle,
  children,
  gradient = ['#6366f1', '#8b5cf6'],
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  gradient?: string[];
  delay?: number;
}) => (
  <AnimatedCard delay={delay}>
    <View className="rounded-3xl bg-zinc-800 p-5">
      {/* Dark mode background */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-100">{title}</Text>
        {/* Light text */}
        {subtitle && <Text className="text-sm text-gray-300">{subtitle}</Text>}
      </View>
      {children}
    </View>
  </AnimatedCard>
);

const ChartCard = ({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <AnimatedCard delay={delay}>
    {/* Dark mode background, border, and shadow */}
    <View className="mb-5 rounded-3xl border border-zinc-700 bg-zinc-800 p-5 shadow-xl">
      <View className="mb-4 flex-row flex-wrap items-center justify-between">
        <Text className="text-xl font-bold text-gray-100">{title}</Text>
        {/* Light text */}
        {subtitle && <Text className="text-sm text-gray-300">{subtitle}</Text>}
        {/* Lighter gray text */}
      </View>
      {children}
    </View>
  </AnimatedCard>
);

const EnhancedKPICard = ({
  title,
  value,
  icon,
  unit,
  change,
  color = '#6366f1',
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: string;
  unit?: string;
  change?: number;
  color?: string;
  delay?: number;
}) => (
  <AnimatedCard delay={delay}>
    <LinearGradient
      colors={[color, `${color}90`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        padding: 10,
        width: 100,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View className="items-center">
        <FontAwesome5 name={icon as any} size={24} color="white" />
        <Text className="mt-2 text-3xl font-bold text-white">{value}</Text>
        <Text className="text-center text-xs text-white opacity-90">
          {title}
          {unit ? ` (${unit})` : ''}
        </Text>
        {change !== undefined && (
          <View className="mt-1 flex-row items-center">
            <FontAwesome5
              name={change >= 0 ? 'arrow-up' : 'arrow-down'}
              size={10}
              color="white"
            />
            <Text className="ml-1 text-xs text-white opacity-90">
              {Math.abs(change).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  </AnimatedCard>
);
const InsightCard = ({
  icon,
  title,
  value,
  subtitle,
  color = '#10b981',
}: {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
}) => (
  <View className="mr-4 w-36 rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow-md">
    {/* Dark mode background, border, shadow */}
    <View className="mb-2 flex-row items-center">
      <View
        className="mr-2 size-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        <FontAwesome5 name={icon as any} size={14} color={color} />
      </View>
      <Text className="flex-1 text-sm font-medium text-gray-200">{title}</Text>
      {/* Lighter text */}
    </View>
    <Text className="text-lg font-bold text-white">{value}</Text>
    {/* White text */}
    {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
    {/* Grayer text */}
  </View>
);
const StatCard = ({
  label,
  value,
  icon,
  color = '#6366f1',
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) => (
  <View className="flex-1 items-center rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow-md">
    {/* Dark mode background, border, shadow */}
    <View
      className="mb-2 size-10 items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}20` }}
    >
      <FontAwesome5 name={icon as any} size={16} color={color} />
    </View>
    <Text className="text-lg font-bold text-white">{value}</Text>
    {/* White text */}
    <Text className="text-center text-xs text-gray-400">{label}</Text>
    {/* Grayer text */}
  </View>
);

const TabButton = ({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mr-4 rounded-full px-4 py-2 ${
      active ? 'bg-indigo-500' : 'bg-zinc-700' // Dark mode inactive tab background
    }`}
  >
    <Text
      className={`text-sm font-medium ${
        active ? 'text-white' : 'text-gray-200' // Dark mode inactive tab text
      }`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

// --- Main Enhanced Progress Screen ---

const EnhancedProgressScreen = () => {
  const { data, isLoading, error, refetch } = useProgressData();

  // console.log(
  //   'data.weeklyComparisonChartData',
  //   data.weeklyComparisonChartData.map((record) => record.lastWeek)
  // );

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading State
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        {/* Dark mode background */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          className="mb-4 size-16 items-center justify-center rounded-full"
        >
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
        <Text className="text-lg font-medium text-gray-200">
          {/* Light text */}
          Analyzing Your Progress...
        </Text>
        <Text className="mt-1 text-sm text-gray-400">This won't take long</Text>
        {/* Grayer text */}
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-red-900 p-6">
        {/* Dark red background */}
        <LinearGradient
          colors={['#ef4444', '#f87171']}
          className="mb-4 size-16 items-center justify-center rounded-full"
        >
          <FontAwesome5 name="exclamation-triangle" size={24} color="white" />
        </LinearGradient>
        <Text className="mb-2 text-center text-xl font-bold text-red-200">
          {/* Light red text */}
          Something went wrong
        </Text>
        <Text className="mb-6 text-center text-red-300">{error.message}</Text>
        {/* Lighter red text */}
        <TouchableOpacity
          onPress={() => refetch()}
          className="rounded-full bg-red-500 px-6 py-3"
        >
          <Text className="font-medium text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Success State
  return (
    <ScreenWrapper>
      {/* Dark mode main background */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#a78bfa" // Light color for refresh indicator in dark mode
          />
        }
      >
        {/* Header */}

        <View className="px-6">
          <Text className="mb-2 text-3xl font-bold text-white">
            Progress Dashboard
          </Text>
          <Text className="font-semibold-nunito text-lg text-white opacity-90">
            Keep up the amazing work! 🚀
          </Text>

          {/* Enhanced KPIs */}
          <View className="mb-6 mt-10 flex-row justify-between">
            <EnhancedKPICard
              title="Current Streak"
              value={data.kpis.currentStreak}
              icon="fire"
              unit="days"
              color="#f59e0b"
              delay={100}
            />
            <EnhancedKPICard
              title="Total XP"
              value={data.kpis.totalXp.toLocaleString()}
              icon="rocket"
              color="#6366f1"
              delay={200}
            />
            <EnhancedKPICard
              title="Gems"
              value={data.kpis.gemsBalance}
              icon="gem"
              color="#10b981"
              delay={300}
            />
          </View>

          {/* Weekly Goal Progress */}
          <GradientCard
            title="Weekly Goals"
            subtitle={`${data.kpis.weeklyGoalProgress.toFixed(0)}% Complete`}
            delay={400}
          >
            <View className="mb-4 flex-row justify-between">
              <View className="mr-4 flex-1">
                {/* Dark mode progress bar background */}
                <View className="mb-2 h-2 rounded-full bg-zinc-700">
                  <View
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${data.kpis.weeklyGoalProgress}%` }}
                  />
                </View>
                <Text className="text-sm text-gray-300">XP Goal</Text>
                {/* Lighter text */}
              </View>
              <View className="flex-1">
                {/* Dark mode progress bar background */}
                <View className="mb-2 h-2 rounded-full bg-zinc-700">
                  <View
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${data.kpis.monthlyGoalProgress}%` }}
                  />
                </View>
                <Text className="text-sm text-gray-300">Monthly Goal</Text>
                {/* Lighter text */}
              </View>
            </View>
          </GradientCard>

          {/* Quick Insights */}
          <View className="mb-6 mt-4">
            <Text className="mb-3 text-lg font-bold text-gray-100">
              {/* Light text */}
              Quick Insights
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <InsightCard
                icon="clock"
                title="Most Active"
                value={data.insights.mostProductiveHour}
                subtitle="Peak performance time"
                color="#8b5cf6"
              />
              <InsightCard
                icon="heart"
                title="Favorite Activity"
                value={data.insights.favoriteActivity}
                subtitle="Your go-to choice"
                color="#ec4899"
              />
              <InsightCard
                icon="chart-line"
                title="Weekly Change"
                value={`${data.insights.weeklyXpChange > 0 ? '+' : ''}${data.insights.weeklyXpChange.toFixed(1)}%`}
                subtitle="XP vs last week"
                color={
                  data.insights.weeklyXpChange >= 0 ? '#10b981' : '#ef4444'
                }
              />
              <InsightCard
                icon="medal"
                title="Consistency"
                value={`${data.insights.consistencyScore.toFixed(0)}%`}
                subtitle="Streak reliability"
                color="#f59e0b"
              />
            </ScrollView>
          </View>

          {/* Tabs */}
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TabButton
                title="Overview"
                active={activeTab === 'overview'}
                onPress={() => setActiveTab('overview')}
              />
              <TabButton
                title="Performance"
                active={activeTab === 'performance'}
                onPress={() => setActiveTab('performance')}
              />
              <TabButton
                title="Trends"
                active={activeTab === 'trends'}
                onPress={() => setActiveTab('trends')}
              />
            </ScrollView>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View className="overflow-hidden">
              {/* Weekly XP Chart */}
              <ChartCard
                title="This Week's XP"
                subtitle="Last 7 days"
                delay={500}
              >
                <BarChart
                  data={data.weeklyXpChartData}
                  width={screenWidth - 80}
                  height={160}
                  barWidth={28} // Kept from your original for potentially slightly wider bars than monthly
                  barBorderRadius={8}
                  spacing={12} // Kept from your original for potentially slightly more spacing
                  yAxisTextStyle={{ color: '#d1d5db', fontSize: 12 }} // Applied fontSize
                  xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 12 }} // Applied fontSize
                  noOfSections={4} // Kept original number of sections for weekly data
                  // You might want to define maxValue and stepValue based on your XP range
                  // For example:
                  // maxValue={100} // Example max XP, adjust based on your data
                  // stepValue={25} // Example step, adjust based on your data
                  isAnimated
                  animationDuration={1000}
                  frontColor="#6366f1" // Your original frontColor
                  gradientColor="#6366f1" // Your original gradientColor (can be different shades for more visual effect)
                  backgroundColor="transparent"
                  showVerticalLines={true} // From example
                  verticalLinesColor="rgba(255,255,255,0.08)" // From example
                  rulesColor="rgba(255,255,255,0.08)" // From example
                  initialSpacing={20} // From example
                  yAxisLabelWidth={30} // From example
                  showYAxisIndices={true} // From example
                  formatYLabel={(value) => `${value}`} // From example
                  hideOrigin={false} // From example
                  showValuesAsTopLabel={true} // **Important for showing XP value**
                  topLabelTextStyle={{
                    color: '#6366f1', // Matching your bar color
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}
                  topLabelContainerStyle={{ marginBottom: 6 }} // From example
                  showGradient={true} // From example
                  cappedBars={true} // From example
                  capColor="#4338ca" // A darker shade of your bar color for the cap
                  capThickness={2} // From example
                  pressEnabled={true} // From example
                  showDataPointOnPress={true} // From example
                  focusEnabled={true} // From example
                  onPress={(item, index) => {
                    console.log(
                      `Pressed weekly bar: ${item.label} with XP: ${item.value}`
                    );
                    // Add your specific logic here, e.g., show a detailed modal
                  }}
                  disablePress={false} // From example
                  activeOpacity={0.7} // From example
                  barStyle={{
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)', // From example
                  }}
                  labelTextStyle={{
                    color: '#d1d5db',
                    fontSize: 12,
                    fontWeight: '500',
                  }} // From example for X-axis labels
                  yAxisThickness={1} // From example
                  yAxisColor="rgba(255,255,255,0.1)" // From example
                  xAxisThickness={1} // From example
                  xAxisColor="rgba(255,255,255,0.1)" // From example
                  rulesThickness={0.5} // From example
                  verticalLinesThickness={0.5} // From example
                />
              </ChartCard>

              {/* Activity Focus */}
              <ChartCard
                title="Activity Focus"
                subtitle="Distribution"
                delay={600}
              >
                <View className="items-center py-4">
                  <PieChart
                    data={data.activityPieChartData}
                    donut
                    showText
                    textColor="white"
                    fontWeight="bold"
                    radius={85}
                    innerRadius={35}
                    innerCircleColor={colors.charcoal[800]}
                    textSize={12}
                    focusOnPress
                    toggleFocusOnPress
                    // showTextBackground
                    // textBackgroundRadius={16}
                    centerLabelComponent={() => (
                      <View className="items-center">
                        <Text className="text-2xl font-bold text-gray-200">
                          {/* Light text */}
                          {data.kpis.totalActivities}
                        </Text>
                        <Text className="text-xs text-white">
                          {/* Grayer text */}
                          Activities
                        </Text>
                      </View>
                    )}
                  />
                </View>
                <View className="mt-4 flex-row flex-wrap justify-center">
                  {data.activityPieChartData.map((item, index) => (
                    <View
                      key={index}
                      className="mx-2 mb-2 flex-row items-center"
                    >
                      <View
                        className="mr-2 size-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <Text className="text-sm text-gray-300">
                        {/* Lighter text */}
                        {item.label} ({item.text})
                      </Text>
                    </View>
                  ))}
                </View>
              </ChartCard>

              {/* Streak History */}
              <ChartCard
                title="Streak History"
                subtitle="Your consistency journey"
                delay={700}
              >
                <LineChart
                  data={data.streakHistoryChartData}
                  width={screenWidth - 80}
                  height={160}
                  areaChart
                  yAxisOffset={0}
                  yAxisTextNumberOfLines={1}
                  curved
                  // Enhanced gradient with more vibrant colors
                  startFillColor="rgba(16, 185, 129, 0.4)"
                  endFillColor="rgba(16, 185, 129, 0.02)"
                  startOpacity={0.9}
                  endOpacity={0.05}
                  // Better spacing for readability
                  initialSpacing={20}
                  spacing={30}
                  // Enhanced line styling
                  color="#10b981"
                  thickness={2.5}
                  // Improved text styling with better contrast
                  yAxisTextStyle={{
                    color: '#9ca3af',
                    fontSize: 11,
                    fontWeight: '500',
                  }}
                  xAxisLabelTextStyle={{
                    color: '#9ca3af',
                    fontSize: 10,
                    fontWeight: '500',
                  }}
                  // Enhanced data points
                  hideDataPoints={false}
                  dataPointsColor="#10b981"
                  dataPointsRadius={3}
                  dataPointsColor2="#ffffff"
                  dataPointsRadius2={2}
                  // Smooth animations
                  isAnimated
                  animationDuration={2000}
                  animateOnDataChange
                  animationEasing="ease-out"
                  // Clean background
                  backgroundColor="transparent"
                  // Additional enhancements
                  showVerticalLines={false}
                  showHorizontalLines={true}
                  horizontalLinesColor="rgba(156, 163, 175, 0.1)"
                  rulesColor="rgba(156, 163, 175, 0.1)"
                  rulesType="solid"
                  // Interactive features
                  pressEnabled={true}
                  showStripOnPress={true}
                  stripColor="rgba(16, 185, 129, 0.2)"
                  stripWidth={2}
                  stripOpacity={0.8}
                  // Enhanced tooltips/labels
                  showTextOnPress={true}
                  textColor="#10b981"
                  textFontSize={12}
                  textBackgroundColor="rgba(0, 0, 0, 0.8)"
                  textBackgroundRadius={6}
                  // Smooth curve adjustments
                  curveType="cardinal"
                  // Better axis formatting with integer values only
                  formatYLabel={(value) => Math.round(value).toString()}
                  noOfSections={Math.min(
                    Math.max(
                      ...data.streakHistoryChartData.map((item) => item.value)
                    ),
                    6
                  )}
                  maxValue={Math.max(
                    ...data.streakHistoryChartData.map((item) => item.value)
                  )}
                  stepValue={1}
                  mostNegativeValue={0}
                  // Enhanced visual feedback
                  focusEnabled={true}
                  delayBeforeUnFocus={300}
                />
              </ChartCard>
            </View>
          )}

          {activeTab === 'performance' && (
            <>
              {/* Performance Stats */}
              <ChartCard title="Performance Stats" delay={500}>
                <View className="flex-row justify-between gap-4">
                  <StatCard
                    label="Best Day"
                    value={`${data.performanceMetrics.bestDay.xp} XP`}
                    icon="trophy"
                    color="#f59e0b"
                  />
                  <StatCard
                    label="Avg Session"
                    value={`${data.performanceMetrics.averageSessionDuration}m`}
                    icon="clock"
                    color="#6366f1"
                  />
                  <StatCard
                    label="Total Hours"
                    value={`${Math.round(data.detailedStats.totalMinutesActive / 60)}h`}
                    icon="calendar"
                    color="#10b981"
                  />
                </View>
              </ChartCard>

              {/* Weekly Comparison */}
              <View className="overflow-hidden">
                <ChartCard
                  title="Weekly Comparison (XP)"
                  subtitle="This week vs last week"
                  delay={600}
                >
                  <BarChart
                    data={data.weeklyComparisonChartData.flatMap(
                      (item, index) => [
                        {
                          value: item.lastWeek,
                          // Highlight: Only show label for the 'lastWeek' bar of each pair
                          label: item.label.slice(0, 3), // e.g., "MON"
                          spacing: 2, // Spacing between bars in a pair
                          labelWidth: 30, // Adjust as needed
                          frontColor: '#a1a1aa', // Muted color for Last Week (gray-400)
                          gradientColor: '#71717a',
                          // No topLabelComponent here, use showValuesAsTopLabel prop
                        },
                        {
                          value: item.thisWeek,
                          label: '', // Highlight: EMPTY LABEL for the 'thisWeek' bar
                          spacing: 12, // Highlight: MORE SPACING AFTER THIS BAR to separate pairs
                          labelWidth: 30, // Adjust as needed
                          frontColor: '#6366f1', // Vibrant color for This Week (indigo-500)
                          gradientColor: '#8b5cf6',
                          // No topLabelComponent here, use showValuesAsTopLabel prop
                        },
                      ]
                    )}
                    width={screenWidth - 80}
                    height={160}
                    barWidth={25} // Adjusted bar width for better appearance
                    barBorderRadius={6}
                    // spacing={8} // This prop controls spacing AFTER each individual bar.
                    // We're controlling spacing using the `spacing` property within each data item.
                    yAxisTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                    xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                    noOfSections={4}
                    maxValue={
                      Math.max(
                        ...data.weeklyComparisonChartData.map((item) =>
                          Math.max(item.thisWeek, item.lastWeek || 0)
                        )
                      ) + 5
                    }
                    stepValue={Math.ceil(
                      Math.max(
                        ...data.weeklyComparisonChartData.map((item) =>
                          Math.max(item.thisWeek, item.lastWeek || 0)
                        )
                      ) / 4
                    )}
                    isAnimated
                    animationDuration={1000}
                    backgroundColor="transparent"
                    showVerticalLines={true}
                    verticalLinesColor="rgba(255,255,255,0.08)"
                    rulesColor="rgba(255,255,255,0.08)"
                    initialSpacing={15}
                    yAxisLabelWidth={35}
                    showYAxisIndices={true}
                    formatYLabel={(value) => `${value}`}
                    hideOrigin={false}
                    showValuesAsTopLabel={true} // Apply top labels to ALL bars
                    topLabelTextStyle={{
                      color: '#cbd5e1', // Neutral color for top labels
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                    topLabelContainerStyle={{ marginBottom: 4 }}
                    showGradient={true}
                    cappedBars={true}
                    capColor="#4f46e5"
                    capThickness={2}
                    pressEnabled={true}
                    onPress={(item, index) => {
                      // 'index' here refers to the flattened array index
                      const originalIndex = Math.floor(index / 2);
                      const originalItem =
                        data.weeklyComparisonChartData[originalIndex];
                      const isThisWeekBar = index % 2 !== 0; // True if odd index (thisWeek), false if even (lastWeek)

                      if (isThisWeekBar) {
                        console.log(
                          `${originalItem.label}: This Week: ${originalItem.thisWeek}`
                        );
                      } else {
                        console.log(
                          `${originalItem.label}: Last Week: ${originalItem.lastWeek || 0}`
                        );
                      }
                    }}
                    activeOpacity={0.7}
                    yAxisThickness={1}
                    yAxisColor="rgba(255,255,255,0.1)"
                    xAxisThickness={1}
                    xAxisColor="rgba(255,255,255,0.1)"
                    rulesThickness={0.5}
                    verticalLinesThickness={0.5}
                  />

                  {/* Enhanced Legend - update colors to match chart */}
                  <View className="mt-4 flex-row justify-center">
                    <View className="mx-4 flex-row items-center">
                      <View className="mr-2 size-3 rounded-full bg-indigo-500" />
                      <Text className="text-sm font-medium text-gray-300">
                        This Week
                      </Text>
                    </View>
                    <View className="mx-4 flex-row items-center">
                      <View className="mr-2 size-3 rounded-full bg-gray-400" />
                      <Text className="text-sm font-medium text-gray-300">
                        Last Week
                      </Text>
                    </View>
                  </View>

                  {/* Simple weekly totals */}
                  <View className="mx-4 mt-4 flex-row justify-between rounded-lg bg-gray-800/20 p-3">
                    <View className="items-center">
                      <Text className="text-xs text-gray-400">This Week</Text>
                      <Text className="text-lg font-bold text-indigo-400">
                        {data.weeklyComparisonChartData.reduce(
                          (sum, item) => sum + item.thisWeek,
                          0
                        )}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-xs text-gray-400">Last Week</Text>
                      <Text className="text-lg font-bold text-gray-400">
                        {data.weeklyComparisonChartData.reduce(
                          (sum, item) => sum + (item.lastWeek || 0),
                          0
                        )}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-xs text-gray-400">Change</Text>
                      <Text
                        className={`text-lg font-bold ${
                          data.weeklyComparisonChartData.reduce(
                            (sum, item) => sum + item.thisWeek,
                            0
                          ) >=
                          data.weeklyComparisonChartData.reduce(
                            (sum, item) => sum + (item.lastWeek || 0),
                            0
                          )
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {(() => {
                          const thisWeekTotal =
                            data.weeklyComparisonChartData.reduce(
                              (sum, item) => sum + item.thisWeek,
                              0
                            );
                          const lastWeekTotal =
                            data.weeklyComparisonChartData.reduce(
                              (sum, item) => sum + (item.lastWeek || 0),
                              0
                            );
                          if (lastWeekTotal === 0)
                            return thisWeekTotal > 0 ? '+100%' : '0%';
                          const change = (
                            ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) *
                            100
                          ).toFixed(0);
                          return `${change > 0 ? '+' : ''}${change}%`;
                        })()}
                      </Text>
                    </View>
                  </View>
                </ChartCard>
              </View>
              {/* Hourly Activity Pattern */}
              <View className="overflow-hidden">
                <ChartCard
                  title="Activity Pattern"
                  subtitle="24-hour breakdown"
                  delay={700}
                >
                  <BarChart
                    data={data.hourlyActivityChartData}
                    width={screenWidth - 80}
                    height={140}
                    barWidth={35}
                    barBorderRadius={4}
                    spacing={4}
                    yAxisTextStyle={{ color: '#d1d5db' }} // Lighter gray for axis text
                    xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 10 }} // Lighter gray for axis labels
                    noOfSections={3}
                    isAnimated
                    animationDuration={1200}
                    frontColor="#8b5cf6"
                    backgroundColor="transparent" // Ensure chart background is transparent
                  />
                </ChartCard>
              </View>
            </>
          )}

          {activeTab === 'trends' && (
            <View className="overflow-hidden">
              {/* Monthly Activity */}
              <ChartCard
                title="Monthly Activity"
                subtitle="Last 6 months"
                delay={500}
              >
                <BarChart
                  data={data.monthlyActivityChartData}
                  width={screenWidth - 80}
                  height={160}
                  barWidth={35}
                  barBorderRadius={8}
                  spacing={15}
                  yAxisTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                  xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                  noOfSections={6}
                  maxValue={15}
                  stepValue={3}
                  isAnimated
                  animationDuration={1000}
                  frontColor="#10b981"
                  gradientColor="#34d399"
                  backgroundColor="transparent"
                  showVerticalLines={true}
                  verticalLinesColor="rgba(255,255,255,0.08)"
                  rulesColor="rgba(255,255,255,0.08)"
                  initialSpacing={20}
                  yAxisLabelWidth={30}
                  showYAxisIndices={true}
                  formatYLabel={(value) => `${value}`}
                  hideOrigin={false}
                  showValuesAsTopLabel={true}
                  topLabelTextStyle={{
                    color: '#10b981',
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}
                  topLabelContainerStyle={{ marginBottom: 6 }}
                  showGradient={true}
                  cappedBars={true}
                  capColor="#059669"
                  capThickness={2}
                  pressEnabled={true}
                  showDataPointOnPress={true}
                  focusEnabled={true}
                  onPress={(item, index) => {
                    console.log(
                      `Pressed bar: ${item.label} with value: ${item.value}`
                    );
                  }}
                  disablePress={false}
                  activeOpacity={0.7}
                  barStyle={{
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                  labelTextStyle={{
                    color: '#d1d5db',
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                  yAxisThickness={1}
                  yAxisColor="rgba(255,255,255,0.1)"
                  xAxisThickness={1}
                  xAxisColor="rgba(255,255,255,0.1)"
                  rulesThickness={0.5}
                  verticalLinesThickness={0.5}
                />
              </ChartCard>

              {/* Monthly XP Trend */}
              <ChartCard
                title="XP Progression"
                subtitle="Monthly XP earned"
                delay={600}
              >
                <LineChart
                  data={data.monthlyXpChartData}
                  width={screenWidth - 80}
                  height={160}
                  curved
                  color="#f59e0b"
                  thickness={3}
                  yAxisTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                  xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                  dataPointsColor="#f59e0b"
                  dataPointsRadius={5}
                  textShiftY={-8}
                  textShiftX={-10}
                  textColor="#f59e0b"
                  textFontSize={12}
                  isAnimated
                  animationDuration={1500}
                  backgroundColor="transparent"
                  showVerticalLines={true}
                  verticalLinesColor="rgba(255,255,255,0.08)"
                  rulesColor="rgba(255,255,255,0.08)"
                  spacing={50}
                  initialSpacing={20}
                  maxValue={140}
                  minValue={0}
                  noOfSections={7}
                  yAxisLabelWidth={35}
                  showYAxisIndices={true}
                  formatYLabel={(value) => `${value}`}
                  stepValue={20}
                  hideOrigin={false}
                  showDataPointOnPress={true}
                  pressEnabled={true}
                  focusEnabled={true}
                  showStripOnPress={true}
                  stripColor="rgba(245, 158, 11, 0.3)"
                  stripWidth={2}
                  stripOpacity={0.7}
                  pointerConfig={{
                    pointer1Color: '#f59e0b',
                    pointerStripUptoDataPoint: true,
                    pointerStripColor: 'rgba(245, 158, 11, 0.5)',
                    pointerStripWidth: 2,
                    strokeDashArray: [2, 5],
                    pointerLabelComponent: (items) => {
                      return (
                        <View
                          style={{
                            height: 90,
                            width: 100,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            borderRadius: 6,
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderWidth: 1,
                            borderColor: '#f59e0b',
                          }}
                        >
                          <Text
                            style={{
                              color: '#f59e0b',
                              fontSize: 12,
                              fontWeight: 'bold',
                            }}
                          >
                            {items[0].label}
                          </Text>
                          <Text
                            style={{
                              color: '#ffffff',
                              fontSize: 14,
                              marginTop: 6,
                            }}
                          >
                            {items[0].value}
                          </Text>
                        </View>
                      );
                    },
                  }}
                />
              </ChartCard>

              {/* XP Progress Over Time */}
              <ChartCard
                title="Recent XP Activity"
                subtitle="Last 30 days"
                delay={700}
              >
                <LineChart
                  data={data.xpProgressChartData}
                  width={screenWidth - 80}
                  height={140}
                  areaChart
                  curved
                  startFillColor="rgba(236, 72, 153, 0.4)"
                  endFillColor="rgba(236, 72, 153, 0.02)"
                  color="#ec4899"
                  thickness={2}
                  yAxisTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                  xAxisTextStyle={{ color: '#d1d5db', fontSize: 12 }}
                  showVerticalLines={true}
                  verticalLinesColor="rgba(255,255,255,0.1)"
                  rulesColor="rgba(255,255,255,0.1)"
                  dataPointsColor="#ec4899"
                  dataPointsRadius={3}
                  hideDataPoints={false}
                  isAnimated
                  animationDuration={1200}
                  backgroundColor="transparent"
                  initialSpacing={10}
                  spacing={40}
                  maxValue={60}
                  minValue={0}
                  noOfSections={4}
                  yAxisLabelWidth={30}
                  showYAxisIndices={true}
                  formatYLabel={(value) => `${value}`}
                  xAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 10 }}
                  yAxisLabelTextStyle={{ color: '#d1d5db', fontSize: 10 }}
                />
              </ChartCard>
            </View>
          )}

          {/* Achievement Banner */}

          <View className="flex-row items-center">
            <View className="mr-4 size-12 items-center justify-center rounded-full bg-opacity-20">
              <FontAwesome5 name="trophy" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">
                Outstanding Progress!
              </Text>
              <Text className="text-sm text-white opacity-90">
                You've completed {data.kpis.totalActivities} activities and
                earned {data.kpis.totalXp.toLocaleString()} XP total. Keep it
                up!
              </Text>
            </View>
          </View>

          {/* Detailed Stats Grid */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-bold text-gray-100">
              {/* Light text */}
              Detailed Statistics
            </Text>
            <View className="flex-row justify-between">
              <View className="mr-2 flex-1 rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow-md">
                {/* Dark mode background, border, shadow */}
                <Text className="text-2xl font-bold text-indigo-400">
                  {/* Slightly lighter indigo for contrast */}
                  {data.detailedStats.longestStreak}
                </Text>
                <Text className="text-sm text-gray-300">Longest Streak</Text>
                {/* Lighter text */}
              </View>
              <View className="ml-2 flex-1 rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow-md">
                {/* Dark mode background, border, shadow */}
                <Text className="text-2xl font-bold text-green-400">
                  {/* Slightly lighter green for contrast */}
                  {data.detailedStats.activeDaysThisMonth}
                </Text>
                <Text className="text-sm text-gray-300">
                  {/* Lighter text */}
                  Active Days This Month
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EnhancedProgressScreen;
