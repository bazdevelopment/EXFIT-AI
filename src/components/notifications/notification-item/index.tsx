import dayjs from 'dayjs';
import React from 'react';
import { View } from 'react-native';

import CardWrapper from '@/components/card-wrapper';
import { colors, Text } from '@/components/ui';
import { translate, useSelectedLanguage } from '@/core';

import { type INotificationItem } from './notification-item.interface';

const NotificationItem = ({
  notification,
  onMarkNotificationAsRead,
  onShowNotification,
}: {
  notification: INotificationItem;
  onShowNotification: () => void;
  onMarkNotificationAsRead: ({
    notificationId,
    language,
  }: {
    notificationId: string;
    language: string;
  }) => void;
}) => {
  const { language } = useSelectedLanguage();

  const isUnread = !notification.isRead;

  return (
    <CardWrapper
      key={notification.id}
      chevronColor={colors.white}
      isEntirelyClickable
      onPress={() => {
        onShowNotification({
          title: notification.title,
          date: notification.createdAt,
          body: notification.body,
        });

        isUnread &&
          onMarkNotificationAsRead({
            notificationId: notification.docId,
            language,
          });
      }}
      className={`
        flex-row items-center rounded-lg border-l-4 
        ${
          isUnread
            ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-l-gray-300 bg-white dark:bg-gray-800'
        } 
        px-4 py-3
      `}
    >
      <View className="flex-1 space-y-1">
        {/* Header row with title and status */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className={`
                font-medium-poppins text-base 
                ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}
              `}
              numberOfLines={2}
            >
              {notification.title}
            </Text>
          </View>

          {/* Compact status indicator */}
          {isUnread && (
            <View className="mr-3 rounded-full bg-blue-500 px-2 py-0.5">
              <Text className="font-medium-poppins text-xs text-white">
                {translate('general.new')}
              </Text>
            </View>
          )}
        </View>

        {/* Body text */}
        <Text
          className="mt-1font-primary-poppins w-[90%] text-sm text-gray-600 dark:text-gray-400"
          numberOfLines={2}
        >
          {notification.body}
        </Text>

        {/* Footer with timestamp and optional badge */}
        <View className="flex-row items-center justify-between pt-1">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {dayjs(notification.createdAt)
              .locale(language)
              .format('MMM D, YYYY • h:mm A')}
          </Text>
        </View>
      </View>
    </CardWrapper>
  );
};

export default NotificationItem;
