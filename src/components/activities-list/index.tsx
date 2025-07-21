import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import dayjs from '../../lib/dayjs';
import { Button, colors, Text } from '../ui';
import { FlashIcon, GemIcon } from '../ui/assets/icons';

// Types
interface Activity {
  activityName: string;
  createdAt: string;
  date: { _nanoseconds: number; _seconds: number };
  description: string;
  durationMinutes: number;
  excuseReason: string;
  gemsEarned: number;
  id: string;
  overcome: boolean;
  status: 'completed' | 'attended' | 'active' | 'missed';
  type: string;
  xpEarned: number;
}

interface ActivityListProps {
  activities: Activity[];
  onAddActivity?: () => void;
  onActivityPress?: (activity: Activity) => void;
  isToday: boolean;
  showHeading?: boolean;
}

// Activity type icons mapping
const getActivityIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    custom_ai_task: '🤖',
    custom_activity: '🏃',
    workout: '💪',
    cardio: '❤️',
    strength: '🏋️',
    yoga: '🧘',
    walking: '🚶',
    running: '🏃',
    cycling: '🚴',
    swimming: '🏊',
    default: '⚡',
  };
  return iconMap[type] || iconMap.default;
};

// Status configuration
const getStatusConfig = (status: string) => {
  const configs = {
    completed: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Completed',
      dot: 'bg-emerald-400',
    },
    attended: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      label: 'Completed',
      dot: 'bg-emerald-400',
    },
    active: {
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      label: 'Unfinished',
      dot: 'bg-amber-400',
    },
    missed: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      label: 'Missed',
      dot: 'bg-red-400',
    },
  };
  return configs[status as keyof typeof configs] || configs.active;
};

// Individual Activity Card Component
const ActivityCard: React.FC<{
  activity: Activity;
  onPress?: () => void;
}> = ({ activity }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);
  const statusConfig = getStatusConfig(activity.status);
  const hasDescription =
    activity.description && activity.description.length > 0;

  // Check if description is long enough to need expansion (roughly 2 lines = ~100 characters)
  const isDescriptionLong =
    activity.description && activity.description.length > 100;
  return (
    <View
      // onPress={onPress}
      // activeOpacity={0.8}
      className="mb-3 overflow-hidden rounded-2xl border border-white/20 bg-black/40"
    >
      {/* Main Content */}
      <View className="p-4">
        {/* Header Row */}
        <View className="mb-3 flex-row items-start justify-between">
          {/* Activity Info */}
          <View className="mr-3 flex-1 flex-row items-start">
            {/* Icon */}
            <View className="mr-3 size-11 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <Text className="text-lg">{getActivityIcon(activity.type)}</Text>
            </View>

            {/* Activity Details */}
            <View className="flex-1">
              <Text className="mb-1 font-bold-poppins text-base leading-tight text-white">
                {activity.activityName}
              </Text>
              <View className="mb-1 flex-row items-center">
                <Text className="mr-2 text-xs text-gray-300">
                  {dayjs(activity.createdAt).format('h:mm A')}
                </Text>
                <View className="mr-2 size-1 rounded-full bg-gray-500" />
                <Text className="text-xs text-gray-300">
                  {activity.durationMinutes}min
                </Text>
              </View>
            </View>
          </View>

          {/* Status Badge */}
          <View
            className={`rounded-lg border px-2.5 py-1 ${statusConfig.bg} ${statusConfig.border}`}
          >
            <View className="flex-row items-center">
              <View
                className={`size-1.5 rounded-full ${statusConfig.dot} mr-1.5`}
              />
              <Text
                className={`font-semibold-poppins text-sm ${statusConfig.text}`}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Description (if available) */}
        {hasDescription && (
          <View className="mb-3 rounded-lg border-l-2 border-l-blue-400/50 bg-white/5 p-2.5">
            {isDescriptionExpanded ? (
              <Markdown style={lightStyles}>{activity.description}</Markdown>
            ) : (
              <Text
                className="text-sm leading-relaxed text-gray-300"
                numberOfLines={isDescriptionExpanded ? undefined : 2}
              >
                {activity.description}
              </Text>
            )}

            {/* See More/Less Button */}
            {isDescriptionLong && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering the card's onPress
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="mt-2 self-start"
                activeOpacity={0.7}
              >
                <Text className="font-semibold-poppins text-sm text-blue-400 dark:text-blue-400">
                  {isDescriptionExpanded ? 'See less' : 'See more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom Row - Rewards */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            {/* Gems */}
            <View className="mr-4 flex-row items-center gap-2 rounded-lg bg-yellow-500/10 px-2.5 py-1">
              <GemIcon width={18} height={18} />
              <Text className="font-bold-poppins text-sm text-yellow-400">
                {activity.gemsEarned}
              </Text>
            </View>

            {/* XP */}
            <View className="flex-row items-center gap-2 rounded-lg bg-purple-500/10 px-2.5 py-1">
              <FlashIcon width={18} height={18} />
              <Text className="font-bold-poppins text-sm text-purple-400">
                {activity.xpEarned}
              </Text>
            </View>
          </View>

          {/* Type Badge */}
          <View className="rounded-md bg-gray-500/20 px-2 py-1">
            <Text className="text-xs font-medium capitalize text-gray-400">
              {activity.type.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar (for active activities) */}
      {/* {activity.status === 'active' && (
        <View className="h-1 bg-gray-700">
          <View className="h-full w-1/3 bg-gradient-to-r from-amber-400 to-orange-500" />
        </View>
      )} */}
    </View>
  );
};

// Main Activities List Component
const ActivitiesList: React.FC<ActivityListProps> = ({
  activities,
  onActivityPress,
  onAddActivity,
  isToday,
  showHeading = true,
}) => {
  // Group activities by completion status for better organization
  const completedActivities = activities?.filter(
    (a) => a.status === 'completed' || a.status === 'attended'
  );
  const activeActivities = activities?.filter((a) => a.status === 'active');
  const missedActivities = activities?.filter((a) => a.status === 'missed');

  if (!activities || activities.length === 0) {
    return (
      <View className="items-center rounded-xl bg-white/5 p-6">
        <Text className="p-3 text-5xl">🎯</Text>
        <Text className="font-semibold-poppins text-lg text-white">
          No Activities Logged
        </Text>

        {isToday && (
          <Text className="mt-2 text-center text-sm text-gray-400">
            Add your first activity for today and begin earning gems and XP.
          </Text>
        )}
        {isToday && (
          <Button
            label="Add Activity"
            variant="default"
            className="mt-4 h-[45px] w-full rounded-full bg-[#4E52FB] pl-5 active:bg-primary-700 dark:bg-[#4E52FB]"
            textClassName="text-base text-center  dark:text-white"
            iconPosition="left"
            onPress={onAddActivity}
          />
        )}
      </View>
    );
  }

  // Calculate total rewards
  const totalGems = activities.reduce(
    (sum, activity) => sum + activity.gemsEarned,
    0
  );
  const totalXP = activities.reduce(
    (sum, activity) => sum + activity.xpEarned,
    0
  );
  const completedCount = completedActivities.length;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {showHeading && (
        <Text className="mb-2 font-bold-poppins text-lg text-white">
          Today's Activities
        </Text>
      )}
      {/* Active Activities First */}
      {activeActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onPress={() => onActivityPress?.(activity)}
        />
      ))}

      {/* Completed Activities */}
      {completedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onPress={() => onActivityPress?.(activity)}
        />
      ))}

      {/* Missed Activities */}
      {missedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onPress={() => onActivityPress?.(activity)}
        />
      ))}
    </ScrollView>
  );
};

const lightStyles: StyleObject = {
  body: {
    marginTop: -7,
    marginBottom: -7,
    fontSize: 14,
    lineHeight: 22,
    color: colors.white,
  },
  heading1: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading2: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading3: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  paragraph: {
    fontFamily: 'Font-Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  list_item: {
    fontFamily: 'Font-Regular',
    fontSize: 14,
    marginBottom: 6,
  },
  span: {
    fontFamily: 'Font-Regular',
    fontSize: 14,
  },
  strong: {
    fontFamily: 'Font-Extra-Bold',
    fontWeight: '800',
    color: '#3195FD', // Highlight bold text with a strong color like amber
  },
  em: {
    fontFamily: 'Font-Extra-Bold',
    color: colors.white, // Slightly muted color for italics to differentiate
  },
  blockquote: {
    borderLeftWidth: 4,
    paddingLeft: 10,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  code_inline: {
    // backgroundColor: '#F3F4F6',
    borderRadius: 4,
    fontFamily: 'Font-Mono',
    fontSize: 13,
    color: '#111827',
  },
};

export default ActivitiesList;
