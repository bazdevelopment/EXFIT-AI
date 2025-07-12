import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

import NotificationItem from '../notification-item';
import { type INotificationItem } from '../notification-item/notification-item.interface';

const NotificationGroup = ({
  date,
  notifications,
  onMarkNotificationAsRead,
  onShowNotification,
}: {
  date: string;
  notifications: INotificationItem[];
  onShowNotification: () => void;
  onMarkNotificationAsRead: ({
    notificationId,
  }: {
    notificationId: string;
  }) => void;
}) => (
  <View className="mt-6 px-4">
    <Text className="mb-2 font-semibold-poppins text-lg">{date}</Text>
    <View className="rounded-2 gap-3">
      {notifications.map((notification: INotificationItem) => {
        return (
          <NotificationItem
            key={notification.docId}
            notification={notification}
            onMarkNotificationAsRead={onMarkNotificationAsRead}
            onShowNotification={onShowNotification}
          />
        );
      })}
    </View>
  </View>
);
export default NotificationGroup;
