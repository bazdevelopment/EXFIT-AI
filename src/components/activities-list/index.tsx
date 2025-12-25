/* eslint-disable max-lines-per-function */
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { type IActivityLog } from '@/api/activity-logs/activity-logs.types';
import { translate } from '@/core';

import ActivityCard from '../activity-card';
import { Button, Text } from '../ui';

// Types

interface ActivityListProps {
  activities: IActivityLog[];
  onAddActivity?: () => void;
  onAddNotes: () => void;
  onActivityPress?: (activity: IActivityLog) => void;
  isToday: boolean;
  showHeading?: boolean;
  showInModal?: boolean;
}

// Main Activities List Component
const ActivitiesList = ({
  activities,
  onActivityPress,
  onAddActivity,
  onAddNotes,
  isToday,
  showHeading = true,
  showInModal = true,
}: ActivityListProps) => {
  // Group activities by completion status for better organization
  const completedActivities = activities?.filter(
    (a) => a.status === 'completed' || a.status === 'attended'
  );
  const activeActivities = activities?.filter((a) => a.status === 'active');
  const missedActivities = activities?.filter((a) => a.status === 'skipped');

  if (!activities || activities.length === 0) {
    return (
      <View className="items-center rounded-xl bg-white/5 p-6">
        <Text className="p-3 text-5xl">🎯</Text>
        <Text className="font-semibold-poppins text-lg text-white">
          {translate('components.ActivitiesList.noActivityFound')}
        </Text>

        {isToday && (
          <Text className="mt-2 text-center text-sm text-gray-400">
            {translate('components.ActivitiesList.addFirstActivity')}
          </Text>
        )}
        {isToday && (
          <Button
            label={translate('components.ActivitiesList.addActivity')}
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
    <View>
      {showHeading && (
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-bold-poppins text-lg text-white">
            {`${translate('components.ActivitiesList.todayActivities')} (${activities?.length})`}
          </Text>
          {isToday && (
            <TouchableOpacity
              onPress={onAddActivity}
              className="ml-2 flex-row items-center rounded-full bg-[#4E52FB] px-3 py-1 dark:bg-[#4E52FB]"
            >
              <Text className="font-medium-poppins text-xl text-white">+</Text>
              {/* <PlusIcon /> */}
              <Text className="ml-2 font-semibold-poppins text-sm text-white">
                {translate('components.ActivitiesList.addActivity')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Active Activities First */}
      {activeActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onAddNotes={onAddNotes}
          showInModal={showInModal}
        />
      ))}

      {/* Completed Activities */}
      {completedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onAddNotes={onAddNotes}
          showInModal={showInModal}
        />
      ))}

      {/* Missed Activities */}
      {missedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onAddNotes={onAddNotes}
          showInModal={showInModal}
        />
      ))}
      {/* {isToday && (
        <Button
          label="Add Activity"
          variant="default"
          className="mt-4 h-[45px] w-full rounded-full bg-[#4E52FB] pl-5 active:bg-primary-700 dark:bg-[#4E52FB]"
          textClassName="text-base text-center  dark:text-white"
          iconPosition="left"
          onPress={onAddActivity}
        />
      )} */}
    </View>
  );
};

export default ActivitiesList;
