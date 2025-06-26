import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActivityCardProps {
  title: string;
  aiSuggestion: string;
  outcome: string;
  stakesEarned: number;
  status: string;
  onPress?: () => void;
}

const statusStyles = {
  attended: 'bg-green-400',
  skipped: 'bg-red-500',
  challenge: 'bg-gray-800',
  inactive: 'border-2 border-dashed border-gray-500',
  empty: '', // No special style for empty
};

// Alternative compact version for lists
const CompactActivityCard: React.FC<ActivityCardProps> = ({
  title,
  status,
  outcome,
  stakesEarned,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="my-1 flex-row items-center rounded-2xl bg-gray-800 p-4 shadow-md"
    >
      {/* Blue accent line */}
      <View className={`mr-4 h-16 w-1 rounded-full  ${statusStyles[status]}`} />

      {/* Content */}
      <View className="flex-1">
        <Text className="mb-1 text-lg font-bold text-white">{title}</Text>
        {/* <Text className="mb-1 text-sm text-gray-400">{aiSuggestion}</Text> */}
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-gray-300">
            {status === 'skipped' ? 'Excuse:' : 'Activities'}:{outcome || 'N/A'}
          </Text>
          <View className="ml-2 flex-row items-center">
            <Text className="text-sm font-semibold text-orange-400">
              {stakesEarned} 🔥
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow */}
      <TouchableOpacity className="ml-2 rounded-full bg-gray-700 p-2">
        <Ionicons name="chevron-forward" size={16} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default CompactActivityCard;
