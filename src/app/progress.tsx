/* eslint-disable max-lines-per-function */
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {} from 'nativewind';
import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';

import { useProgressData } from '@/api/progress/progress.hooks';
import EdgeCaseTemplate from '@/components/edge-case-template';
import FadeInView from '@/components/fade-in-view/fade-in-view';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import SkeletonLoader from '@/components/skeleton-loader';
import { colors, Text } from '@/components/ui';
import { RetryIcon } from '@/components/ui/assets/icons';
import { WarningIllustration } from '@/components/ui/assets/illustrations/warning';
import { translate } from '@/core';

const { width: screenWidth } = Dimensions.get('window');

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
  <FadeInView delay={delay}>
    <View className="rounded-3xl bg-white/10 p-5 dark:bg-white/10">
      {/* Dark mode background */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-semibold-poppins text-xl text-gray-100">
          {title}
        </Text>
        {/* Light text */}
        {subtitle && <Text className="text-sm text-gray-300">{subtitle}</Text>}
      </View>
      {children}
    </View>
  </FadeInView>
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
  <FadeInView delay={delay}>
    {/* Dark mode background, border, and shadow */}
    <View className="mb-5 rounded-3xl border border-zinc-700 bg-white/10 p-5 shadow-xl">
      <View className="mb-4 flex-row flex-wrap items-center justify-between">
        <Text className="font-semibold-poppins text-xl text-gray-100">
          {title}
        </Text>
        {/* Light text */}
        {subtitle && <Text className="text-sm text-gray-300">{subtitle}</Text>}
        {/* Lighter gray text */}
      </View>
      {children}
    </View>
  </FadeInView>
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
  <FadeInView delay={delay}>
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
        <Text className="mt-2 font-semibold-poppins text-3xl text-white">
          {value}
        </Text>
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
  </FadeInView>
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
  <View className="mr-4 w-36 rounded-2xl border border-zinc-700 bg-white/10 p-4 shadow-md">
    {/* Dark mode background, border, shadow */}
    <View className="mb-2 flex-row items-center">
      <View
        className="mr-2 size-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        <FontAwesome5 name={icon as any} size={14} color={color} />
      </View>
      <Text className="flex-1 font-medium-poppins text-sm text-gray-200">
        {title}
      </Text>
      {/* Lighter text */}
    </View>
    <Text className="font-semibold-poppins text-lg text-white">{value}</Text>
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
  <View className="flex-1 items-center rounded-2xl border border-zinc-700 bg-white/10 p-4 shadow-md">
    {/* Dark mode background, border, shadow */}
    <View
      className="mb-2 size-10 items-center justify-center rounded-full"
      style={{ backgroundColor: `${color}20` }}
    >
      <FontAwesome5 name={icon as any} size={16} color={color} />
    </View>
    <Text className="font-semibold-poppins text-lg text-white">{value}</Text>
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
      className={`font-medium-poppins text-sm ${
        active ? 'text-white' : 'text-gray-200' // Dark mode inactive tab text
      }`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const EnhancedProgressScreen = () => {
  const { data, isLoading, error, refetch } = useProgressData();
  // const { isUpgradeRequired } = useSubscriptionAlert();
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
      <ScreenWrapper>
        <SkeletonLoader />
      </ScreenWrapper>
    );
  }

  // Error State
  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-black p-6">
        <EdgeCaseTemplate
          image={<WarningIllustration />}
          title={translate('rootLayout.screens.progress.error')}
          // message="  Something went wrong"
          additionalClassName="px-16"
          primaryAction={{
            label: translate('general.tryAgain'),
            onPress: refetch,
            variant: 'default',
            icon: <RetryIcon color={colors.black} width={18} height={18} />,
          }}
        />
      </View>
    );
  }

  // Success State
  return (
    <ScreenWrapper>
      {/* Dark mode main background */}
      <ScreenHeader title={translate('rootLayout.screens.progress.heading')} />
      {/* {isUpgradeRequired && <UpgradeBanner />} */}

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

        <View className="mt-2 px-6">
          <Text className="font-medium-poppins text-base text-white opacity-90">
            {translate('rootLayout.screens.progress.subheading')}
          </Text>

          {/* Enhanced KPIs */}
          <View className="my-6 flex-row justify-between">
            <EnhancedKPICard
              title="Streak"
              value={data.kpis.currentStreak}
              icon="fire"
              unit="days"
              color="#f59e0b"
              delay={100}
            />
            <EnhancedKPICard
              title="XP"
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
            title={translate('rootLayout.screens.progress.weeklyGoals')}
            subtitle={`${data.kpis.weeklyGoalProgress.toFixed(0)}% ${translate('general.completed')}`}
            delay={400}
          >
            <View className="mb-4 flex-row justify-between">
              <View className="mr-4 flex-1">
                {/* Dark mode progress bar background */}
                <View className="mb-2 h-2 rounded-full bg-white/10">
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
                <Text className="text-sm text-gray-300">
                  {translate('rootLayout.screens.progress.monthlyGoal')}
                </Text>
                {/* Lighter text */}
              </View>
            </View>
          </GradientCard>

          {/* Quick Insights */}
          <View className="mb-6 mt-4">
            <Text className="mb-3 font-semibold-poppins text-lg text-gray-100">
              {/* Light text */}
              {translate('rootLayout.screens.progress.insights')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <InsightCard
                icon="clock"
                title={translate('rootLayout.screens.progress.mostActive')}
                value={data.insights.mostProductiveHour}
                subtitle={translate('rootLayout.screens.progress.peakTime')}
                color="#8b5cf6"
              />
              <InsightCard
                icon="heart"
                title={translate(
                  'rootLayout.screens.progress.favoriteActivity'
                )}
                value={data.insights.favoriteActivity}
                subtitle={translate('rootLayout.screens.progress.choice')}
                color="#ec4899"
              />
              <InsightCard
                icon="chart-line"
                title={translate('rootLayout.screens.progress.weeklyChange')}
                value={`${data.insights.weeklyXpChange > 0 ? '+' : ''}${data.insights.weeklyXpChange.toFixed(1)}%`}
                subtitle={`XP ${translate('rootLayout.screens.progress.lastWeekXP')}`}
                color={
                  data.insights.weeklyXpChange >= 0 ? '#10b981' : '#ef4444'
                }
              />
              <InsightCard
                icon="medal"
                title={translate('rootLayout.screens.progress.consistency')}
                value={`${data.insights.consistencyScore.toFixed(0)}%`}
                subtitle={`Streak ${translate('rootLayout.screens.progress.reliability')}`}
                color="#f59e0b"
              />
            </ScrollView>
          </View>

          {/* Tabs */}
          <View className="mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TabButton
                title={translate('rootLayout.screens.progress.overview')}
                active={activeTab === 'overview'}
                onPress={() => setActiveTab('overview')}
              />
              <TabButton
                title={translate('rootLayout.screens.progress.performance')}
                active={activeTab === 'performance'}
                onPress={() => setActiveTab('performance')}
              />
              <TabButton
                title={translate('rootLayout.screens.progress.trends')}
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
                title={`${translate(
                  'rootLayout.screens.progress.thisWeek'
                )} XP`}
                subtitle={translate(
                  'rootLayout.screens.progress.lastSevenDays'
                )}
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
                title={translate('rootLayout.screens.progress.activityFocus')}
                subtitle={translate('rootLayout.screens.progress.distribution')}
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
                        <Text className="font-semibold-poppins text-2xl text-gray-200">
                          {/* Light text */}
                          {data.kpis.totalActivities}
                        </Text>
                        <Text className="text-xs text-white">
                          {/* Grayer text */}
                          {translate('rootLayout.screens.progress.activities')}
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
                title={`Streak ${translate('rootLayout.screens.progress.history')}`}
                subtitle={translate(
                  'rootLayout.screens.progress.consistencyJourney'
                )}
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
                    label={translate('rootLayout.screens.progress.bestDay')}
                    value={`${data.performanceMetrics.bestDay.xp} XP`}
                    icon="trophy"
                    color="#f59e0b"
                  />
                  <StatCard
                    label={translate(
                      'rootLayout.screens.progress.averageSession'
                    )}
                    value={`${data.performanceMetrics.averageSessionDuration}m`}
                    icon="clock"
                    color="#6366f1"
                  />
                  <StatCard
                    label={translate('rootLayout.screens.progress.totalHours')}
                    value={`${Math.round(data.detailedStats.totalMinutesActive / 60)}h`}
                    icon="calendar"
                    color="#10b981"
                  />
                </View>
              </ChartCard>

              {/* Weekly Comparison */}
              <View className="overflow-hidden">
                <ChartCard
                  title={`${translate('rootLayout.screens.progress.WeeklyComparisonXp')} (XP)`}
                  subtitle={translate(
                    'rootLayout.screens.progress.weeksComparison'
                  )}
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
                      <Text className="font-medium-poppins text-sm text-gray-300">
                        {translate('rootLayout.screens.progress.thisWeeks')}
                      </Text>
                    </View>
                    <View className="mx-4 flex-row items-center">
                      <View className="mr-2 size-3 rounded-full bg-gray-400" />
                      <Text className="font-medium-poppins text-sm text-gray-300">
                        {translate('rootLayout.screens.progress.lastWeek')}
                      </Text>
                    </View>
                  </View>

                  {/* Simple weekly totals */}
                  <View className="mx-4 mt-4 flex-row justify-between rounded-lg bg-gray-800/20 p-3">
                    <View className="items-center">
                      <Text className="text-xs text-gray-400">
                        {translate('rootLayout.screens.progress.thisWeeks')}
                      </Text>
                      <Text className="font-semibold-poppins text-lg text-indigo-400">
                        {data.weeklyComparisonChartData.reduce(
                          (sum, item) => sum + item.thisWeek,
                          0
                        )}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-xs text-gray-400">
                        {translate('rootLayout.screens.progress.lastWeek')}
                      </Text>
                      <Text className="font-semibold-poppins text-lg text-gray-400">
                        {data.weeklyComparisonChartData.reduce(
                          (sum, item) => sum + (item.lastWeek || 0),
                          0
                        )}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-xs text-gray-400">
                        {translate('general.change')}
                      </Text>
                      <Text
                        className={`font-semibold-poppins text-lg ${
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
                  title={translate(
                    'rootLayout.screens.progress.activityPattern'
                  )}
                  subtitle={translate(
                    'rootLayout.screens.progress.hoursBreakdown'
                  )}
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
                title={translate('rootLayout.screens.progress.monthlyActivity')}
                subtitle={translate('rootLayout.screens.progress.lastMonths')}
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
                title={`XP ${translate('rootLayout.screens.progress.progression')}`}
                subtitle={`${translate('rootLayout.screens.progress.monthlyEarned')} XP`}
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
                title={`${translate('rootLayout.screens.progress.recentActivity')} XP`}
                subtitle={translate('rootLayout.screens.progress.last30Days')}
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
              <Text className="font-semibold-poppins text-lg text-white">
                {translate('rootLayout.screens.progress.outstanding')}
              </Text>
              <Text className="text-sm text-white opacity-90">
                {translate('rootLayout.screens.progress.activityReview', {
                  totalActivities: data.kpis.totalActivities,
                  totalXp: data.kpis.totalXp.toLocaleString(),
                })}
              </Text>
            </View>
          </View>

          {/* Detailed Stats Grid */}
          <View className="mb-6 mt-2">
            <Text className="mb-3 font-semibold-poppins text-lg text-gray-100">
              {/* Light text */}
              {translate('rootLayout.screens.progress.statistics')}
            </Text>
            <View className="flex-row justify-between">
              <View className="mr-2 flex-1 rounded-2xl border border-zinc-700 bg-white/10 p-4 shadow-md">
                {/* Dark mode background, border, shadow */}
                <Text className="font-semibold-poppins text-2xl text-indigo-400">
                  {/* Slightly lighter indigo for contrast */}
                  {data.detailedStats.longestStreak}
                </Text>
                <Text className="text-sm text-gray-300">
                  {translate('rootLayout.screens.progress.longest')} Streak
                </Text>
                {/* Lighter text */}
              </View>
              <View className="ml-2 flex-1 rounded-2xl border border-zinc-700 bg-white/10 p-4 shadow-md">
                {/* Dark mode background, border, shadow */}
                <Text className="font-semibold-poppins text-2xl text-green-400">
                  {/* Slightly lighter green for contrast */}
                  {data.detailedStats.physicalActivitiesThisMonth}
                </Text>
                <Text className="text-sm text-gray-300">
                  {/* Lighter text */}
                  {translate(
                    'rootLayout.screens.progress.totalMonthActivities'
                  )}
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
