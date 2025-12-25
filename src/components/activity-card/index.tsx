/* eslint-disable max-lines-per-function */
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

import { translate, useSelectedLanguage } from '@/core';

import { colors, Text } from '../ui';
import { FlashIcon, GemIcon } from '../ui/assets/icons';

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
    skipped: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      label: 'Skipped',
      dot: 'bg-red-400',
    },
  };
  return configs[status as keyof typeof configs] || configs.active;
};

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

// Individual Activity Card Component
const ActivityCard = ({ activity, onAddNotes, showInModal }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);
  const [isEditingNotes, setIsEditingNotes] = React.useState(false);
  const [notes, setNotes] = React.useState(activity.notes || '');
  const [tempNotes, setTempNotes] = React.useState(notes);
  const { language } = useSelectedLanguage();

  const TextInputWrapper = showInModal ? BottomSheetTextInput : TextInput;

  const statusConfig = getStatusConfig(activity.status);
  const hasDescription = !!activity.description;
  const hasNotes = !!notes;
  const isDescriptionLong =
    hasDescription && activity.description!.length > 100;

  const handleSaveNotes = () => {
    if (tempNotes !== notes) {
      setNotes(tempNotes);
      onAddNotes?.({ taskId: activity.id, notes: tempNotes });
    }
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setTempNotes(notes);
    setIsEditingNotes(false);
  };

  const handleAddNotePress = () => {
    setIsEditingNotes(true);
    setTempNotes(notes);
  };

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-white/20 bg-black/40 p-4">
      {/* Header Row */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="mr-3 flex-1 flex-row items-start">
          <View className="mr-3 size-11 items-center justify-center rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Text className="text-lg">{getActivityIcon(activity.type)}</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 font-bold-poppins text-base leading-tight text-white">
              {activity.activityName ||
                (activity.status ===
                translate('components.ActivityCard.activitySkipped')
                  ? translate('components.ActivityCard.dayOff')
                  : '')}
            </Text>
            <View className="mb-1 flex-row items-center">
              <Text className="mr-2 text-sm text-gray-300">
                {dayjs(activity.createdAt).locale(language).format('h:mm A')}
              </Text>
              <View className="mr-2 size-1 rounded-full bg-gray-500" />
              <Text className="text-sm text-gray-300">
                {activity.durationMinutes}min
              </Text>
            </View>
          </View>
        </View>

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
          <Text className="mb-1 font-bold-poppins text-sm tracking-wide text-blue-400/80">
            {translate('components.ActivityCard.description')}
          </Text>
          {isDescriptionExpanded ? (
            <Markdown style={lightStyles}>{activity.description}</Markdown>
          ) : (
            <Text
              className="text-sm leading-relaxed text-gray-300"
              numberOfLines={2}
            >
              {activity.description}
            </Text>
          )}

          {isDescriptionLong && (
            <TouchableOpacity
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 self-start"
              activeOpacity={0.7}
            >
              <Text className="font-semibold-poppins text-sm text-blue-400">
                {isDescriptionExpanded
                  ? translate('general.seeLess')
                  : translate('general.seeMore')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {!!activity.excuseReason && (
        <View className="mb-3 rounded-lg border-l-2 border-l-red-400/50 bg-white/5 p-2.5">
          <Text className="mb-1 font-bold-poppins text-sm tracking-wide text-red-400/80">
            {translate('components.ActivityCard.excuseReason')}
          </Text>

          <Text
            className="text-sm leading-relaxed text-gray-300"
            numberOfLines={2}
          >
            {activity.excuseReason}
          </Text>
        </View>
      )}

      {/* User Notes Section (Conditional) */}
      {(hasNotes || isEditingNotes) && (
        <View className="mb-3 rounded-lg border-l-2 border-l-green-400/50 bg-white/5 p-2.5">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-bold-poppins text-sm  text-green-400/80">
              {translate('components.ActivityCard.yourNotes')}
            </Text>
            {isEditingNotes ? (
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleCancelNotes}
                  className="rounded-md bg-gray-500/20 px-3 py-1.5"
                  activeOpacity={0.7}
                >
                  <Text className="font-medium-poppins text-sm text-white dark:text-white">
                    {translate('general.cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveNotes}
                  className="rounded-md bg-green-500/20 px-3 py-1.5"
                  activeOpacity={0.7}
                >
                  <Text className="font-medium-poppins text-sm text-green-400 dark:text-green-400">
                    {translate('general.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingNotes(true)}
                className="flex-row items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1"
                activeOpacity={0.7}
              >
                <Text className="font-medium-poppins text-sm text-green-400 dark:text-green-400">
                  {translate('general.edit')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {isEditingNotes ? (
            <TextInputWrapper
              placeholder={translate(
                'components.ActivityCard.notesPlaceholder'
              )}
              placeholderTextColor={colors.charcoal[300]}
              className="min-h-[50px] rounded-md border border-gray-500/50 p-2 font-primary-poppins text-sm leading-relaxed text-white"
              multiline
              value={tempNotes}
              onChangeText={setTempNotes}
              autoFocus
            />
          ) : (
            <Text className="text-sm leading-relaxed text-gray-300">
              {notes}
            </Text>
          )}
        </View>
      )}

      {/* Bottom Row - Rewards & Add Note Button */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-4 flex-row items-center gap-2 rounded-lg bg-yellow-500/10 px-2.5 py-1">
            <GemIcon width={18} height={18} />
            <Text className="font-bold-poppins text-sm text-yellow-400">
              {activity.gemsEarned}
            </Text>
          </View>

          <View className="flex-row items-center gap-2 rounded-lg bg-purple-500/10 px-2.5 py-1">
            <FlashIcon width={18} height={18} />
            <Text className="font-bold-poppins text-sm text-purple-400">
              {activity.xpEarned}
            </Text>
          </View>

          {/* Add Note Button - Only show if no notes exist and not editing */}
          {!isEditingNotes && !hasNotes && (
            <TouchableOpacity
              onPress={handleAddNotePress}
              className="ml-3 flex-row items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1"
              activeOpacity={0.7}
            >
              <Text className="text-md">📝</Text>
              <Text className="font-medium-poppins text-sm text-green-400">
                {translate('components.ActivityCard.addNotes')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* <View className="rounded-md bg-gray-500/20 px-2 py-1">
            <Text className="text-[12px] font-medium capitalize text-gray-400">
              {activity.type.replace(/_/g, ' ')}
            </Text>
          </View> */}
      </View>
    </View>
    // </TouchableOpacity>
  );
};

export default ActivityCard;

const lightStyles = {
  body: {
    marginTop: -4,
    marginBottom: -4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.white,
  },
  heading1: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  heading2: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading3: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  paragraph: {
    fontFamily: 'Font-Regular',
    fontSize: 12,
    marginBottom: 4,
  },
  list_item: {
    fontFamily: 'Font-Regular',
    fontSize: 12,
    marginBottom: 3,
  },
  span: {
    fontFamily: 'Font-Regular',
    fontSize: 12,
  },
  strong: {
    fontFamily: 'Font-Extra-Bold',
    fontWeight: '800',
    color: '#3195FD',
  },
  em: {
    fontFamily: 'Font-Extra-Bold',
    color: colors.white,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  code_inline: {
    borderRadius: 3,
    fontFamily: 'Font-Mono',
    fontSize: 11,
    color: '#111827',
  },
};
