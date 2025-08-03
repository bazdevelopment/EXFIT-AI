import { View } from 'react-native';

import { Text } from '../ui';
import { FlashIcon, GemIcon, StreakIcon } from '../ui/assets/icons';
import { LevelIcon } from '../ui/assets/icons/level';

interface UserStats {
  streak: number;
  gems: number;
  xp: number;
  level: number;
}

const StatsGrid: React.FC<{ stats: UserStats }> = ({ stats }) => {
  const statItems = [
    {
      label: 'Streak',
      value: `${stats.streak} days`,
      icon: <StreakIcon width={24} height={24} />,
      color: 'text-orange-400',
    },
    {
      label: 'Gems',
      value: stats.gems.toString(),
      icon: <GemIcon width={24} height={24} />,
      color: 'text-blue-400',
    },
    {
      label: 'XP',
      value: stats.xp.toString(),
      icon: <FlashIcon width={24} height={24} />,
      color: 'text-yellow-400',
    },
    {
      label: 'Level',
      value: stats.level.toString(),
      icon: <LevelIcon width={24} height={24} />,
      color: 'text-purple-400',
    },
  ];

  return (
    <View className="my-7 flex-row justify-around px-4">
      {statItems.map((item, index) => (
        <View key={index} className="items-center">
          <Text className="mb-2 text-2xl">{item.icon}</Text>
          <Text className={`font-semibold text-white ${item.color}`}>
            {item.label}
          </Text>
          <Text className="font-bold-poppins text-gray-300">{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

export default StatsGrid;
