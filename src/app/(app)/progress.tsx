import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { BarChart, PieChartPro } from 'react-native-gifted-charts';

// Mock data for the charts with enhanced styling
const excusesOvercomeData = [
  {
    value: 75,
    color: '#4ECDC4',
    gradientCenterColor: '#26D0CE',
    text: '75%',
    label: 'Overcome',
    shiftTextX: 0,
    shiftTextY: 0,
  },
  {
    value: 25,
    color: '#4A90E2',
    gradientCenterColor: '#357ABD',
    text: '25%',
    label: 'Not Overcome',
    shiftTextX: 0,
    shiftTextY: 0,
  },
];

const activityConsistencyData = [
  {
    value: 0.9,
    label: 'Su',
    frontColor: '#4A90E2',
    gradientColor: '#357ABD',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>0.9</Text>
    ),
  },
  {
    value: 0.95,
    label: 'Mo',
    frontColor: '#4A90E2',
    gradientColor: '#357ABD',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>
        0.95
      </Text>
    ),
  },
  {
    value: 0.85,
    label: 'Tu',
    frontColor: '#4A90E2',
    gradientColor: '#357ABD',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>
        0.85
      </Text>
    ),
  },
  {
    value: 0.45,
    label: 'We',
    frontColor: '#FF6B6B',
    gradientColor: '#FF8E8E',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>
        0.45
      </Text>
    ),
  },
  {
    value: 0.95,
    label: 'Th',
    frontColor: '#4A90E2',
    gradientColor: '#357ABD',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>
        0.95
      </Text>
    ),
  },
  {
    value: 0.9,
    label: 'Fr',
    frontColor: '#4A90E2',
    gradientColor: '#357ABD',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>0.9</Text>
    ),
  },
  {
    value: 0.9,
    label: 'Sa',
    frontColor: '#4A90E2',
    gradientColor: '#357ABD',
    topLabelComponent: () => (
      <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>0.9</Text>
    ),
  },
];

const excuseFrequencyData = [
  {
    value: 4,
    label: 'Too Tired',
    frontColor: '#6366F1',
    gradientColor: '#8B5CF6',
    topLabelComponent: () => (
      <Text
        style={{
          color: 'white',
          fontSize: 12,
          marginBottom: 6,
          fontWeight: 'bold',
        }}
      >
        4
      </Text>
    ),
  },
  {
    value: 3,
    label: 'Gym Crowded',
    frontColor: '#EC4899',
    gradientColor: '#F472B6',
    topLabelComponent: () => (
      <Text
        style={{
          color: 'white',
          fontSize: 12,
          marginBottom: 6,
          fontWeight: 'bold',
        }}
      >
        3
      </Text>
    ),
  },
  {
    value: 4,
    label: 'Feeling Stiff',
    frontColor: '#10B981',
    gradientColor: '#34D399',
    topLabelComponent: () => (
      <Text
        style={{
          color: 'white',
          fontSize: 12,
          marginBottom: 6,
          fontWeight: 'bold',
        }}
      >
        4
      </Text>
    ),
  },
];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <View
    className="mb-6 rounded-2xl bg-gray-800 p-6 shadow-lg"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }}
  >
    <Text className="mb-6 text-center text-xl font-bold text-white">
      {title}
    </Text>
    {children}
  </View>
);

const ProgressScreen: React.FC = () => {
  const renderLegendComponent = () => (
    <View className="mt-6 flex-row items-center justify-center space-x-8">
      <View className="flex-row items-center">
        <View
          className="mr-3 size-4 rounded-full shadow-sm"
          style={{
            backgroundColor: '#4ECDC4',
            shadowColor: '#4ECDC4',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
          }}
        />
        <Text className="text-base font-medium text-white">Overcome</Text>
      </View>
      <View className="flex-row items-center">
        <View
          className="mr-3 size-4 rounded-full shadow-sm"
          style={{
            backgroundColor: '#4A90E2',
            shadowColor: '#4A90E2',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
          }}
        />
        <Text className="text-base font-medium text-white">Not Overcome</Text>
      </View>
    </View>
  );

  const renderDonutText = () => (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>
        75%
      </Text>
      <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Overcome</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Excuses Overcome Pie Chart */}
        <ChartCard title="Excuses Overcome">
          <View className="items-center">
            <PieChartPro
              data={excusesOvercomeData}
              donut={true}
              showGradient={true}
              sectionAutoFocus={true}
              radius={100}
              innerRadius={60}
              innerCircleColor={'#1F2937'}
              centerLabelComponent={renderDonutText}
              showText={false}
              textColor="white"
              textSize={16}
              fontWeight="bold"
              backgroundColor="transparent"
              strokeColor="white"
              strokeWidth={2}
              isThreeD={true}
              shadow={true}
              shadowColor={'#000'}
              shadowOpacity={0.4}
              shadowRadius={8}
            />
            {renderLegendComponent()}
          </View>
        </ChartCard>

        {/* Activity Consistency Bar Chart */}
        <ChartCard title="Activity Consistency">
          <View className="items-center">
            <BarChart
              data={activityConsistencyData}
              width={300}
              height={220}
              barWidth={32}
              spacing={24}
              roundedTop={true}
              roundedBottom={true}
              hideRules={true}
              xAxisThickness={2}
              yAxisThickness={0}
              xAxisColor={'#374151'}
              yAxisColor={'transparent'}
              yAxisTextStyle={{ color: '#9CA3AF', fontSize: 12 }}
              xAxisLabelTextStyle={{
                color: '#D1D5DB',
                fontSize: 13,
                fontWeight: '600',
              }}
              noOfSections={4}
              maxValue={1}
              isAnimated={true}
              animationDuration={1200}
              backgroundColor="transparent"
              showGradient={true}
              cappedBars={true}
              capThickness={4}
              capColor={'#60A5FA'}
              barBorderRadius={8}
              showVerticalLines={false}
              stepValue={0.25}
              initialSpacing={20}
              endSpacing={20}
            />
          </View>
        </ChartCard>

        {/* Excuse Usage Frequency Bar Chart */}
        <ChartCard title="Excuse Usage Frequency">
          <View className="items-center">
            <BarChart
              data={excuseFrequencyData}
              width={300}
              height={220}
              barWidth={45}
              spacing={35}
              roundedTop={true}
              roundedBottom={true}
              hideRules={true}
              xAxisThickness={2}
              yAxisThickness={0}
              xAxisColor={'#374151'}
              yAxisColor={'transparent'}
              yAxisTextStyle={{ color: '#9CA3AF', fontSize: 12 }}
              xAxisLabelTextStyle={{
                color: '#D1D5DB',
                fontSize: 11,
                fontWeight: '600',
                width: 80,
                textAlign: 'center',
              }}
              noOfSections={4}
              maxValue={5}
              onPress={(item) => console.log('Pressed:', item.label)}
              isAnimated={true}
              animationDuration={1200}
              backgroundColor="transparent"
              showGradient={true}
              barBorderRadius={12}
              rotateLabel={false}
              labelWidth={80}
              initialSpacing={20}
              endSpacing={20}
              showVerticalLines={false}
              stepValue={1}
              activeOpacity={0.8}
            />
          </View>
        </ChartCard>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressScreen;
