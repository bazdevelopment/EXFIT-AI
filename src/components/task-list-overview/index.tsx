import { Feather } from '@expo/vector-icons';
import { getCalendars } from 'expo-localization';
import React from 'react';
import { View } from 'react-native';

import TaskCard from '../task-card';
import { type ITaskCardProps } from '../task-card/task-card.interface';
import { Text } from '../ui';

interface TaskListOverviewProps {
  tasks: ITaskCardProps[];
  onCompleteTask?: (task: ITaskCardProps) => void;
  additionalClassName?: string;
}

// Glassmorphism with neon borders
const neonGlass = 'bg-white/5 backdrop-blur-lg border rounded-lg';

const TaskListOverview: React.FC<TaskListOverviewProps> = ({
  tasks,
  onCompleteTask,
  onSkipTask,
  additionalClassName = '',
}) => {
  const [{ timeZone }] = getCalendars();

  const activeTasksCount =
    tasks?.filter((t) => t.status === 'active').length || 0;
  const totalTasksCount = tasks?.length || 0;

  return (
    <View
      style={{ flex: 1, paddingHorizontal: 0 }}
      className={additionalClassName}
    >
      {/* Header */}
      <View className="mx-6 mb-3 flex-row items-center gap-4">
        <Text className="font-extra-bold-poppins text-xl text-white">
          Today's tasks
        </Text>
        {totalTasksCount > 0 && (
          <View className=" flex-row items-center">
            {/* Show "Completed" Badge if all tasks are finished */}
            {activeTasksCount === 0 && (
              <View className="rounded-full bg-green-500 px-4 py-1">
                <Text className="font-bold-poppins text-sm text-white">
                  Completed
                </Text>
              </View>
            )}

            {/* Text for active/inactive tasks */}
            <Text className="text-[#94a3b8]">
              {activeTasksCount > 0
                ? `${activeTasksCount}/${totalTasksCount} active`
                : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Tasks List */}
      {!tasks?.length ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            className={`${neonGlass} rounded-full border-slate-500 p-4 shadow-slate-500/20`}
          >
            <Feather name="coffee" size={36} color="#94a3b8" />
          </View>
          <Text
            style={{
              marginTop: 12,
              fontSize: 18,
              fontWeight: '500',
              color: '#ffffff',
            }}
          >
            No Tasks!
          </Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: '#94a3b8' }}>
            Enjoy your free time.
          </Text>
        </View>
      ) : (
        <>
          {tasks.map((task: ITaskCardProps, index) => {
            const isLastItem = tasks.length - 1 === index;
            return (
              <View key={task.id} className="px-5">
                <TaskCard
                  id={task.id}
                  activityName={task.activityName}
                  durationMinutes={task.durationMinutes}
                  xpEarned={task.xpEarned}
                  gemsEarned={task.gemsEarned}
                  onCompleteTask={() => onCompleteTask(task)}
                  status={task.status}
                  onSkipTask={onSkipTask}
                  timeZone={timeZone ?? 'UTC'}
                />
                {!isLastItem && (
                  <View className="my-2 size-0.5 w-full bg-gray-600" />
                )}
              </View>
            );
          })}
        </>
      )}
    </View>
  );
};

export default TaskListOverview;
