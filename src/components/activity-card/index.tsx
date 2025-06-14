import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ActivityCardProps {
  excusedLog: string;
  aiSuggestion: string;
  outcome: string;
  stakesEarned: number;
  onPress?: () => void;
}

// Alternative compact version for lists
const CompactActivityCard: React.FC<ActivityCardProps> = ({
  excusedLog,
  aiSuggestion,
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
      <View className="mr-4 h-16 w-1 rounded-full bg-blue-500" />

      {/* Content */}
      <View className="flex-1">
        <Text className="mb-1 text-lg font-bold text-white">{excusedLog}</Text>
        <Text className="mb-1 text-sm text-gray-400">{aiSuggestion}</Text>
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm text-gray-300">{outcome}</Text>
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
