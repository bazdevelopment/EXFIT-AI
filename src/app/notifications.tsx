import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import {
  useFetchUserNotifications,
  useMarkNotificationAsRead,
} from '@/api/push-notifications/push-notifications.hooks';
import { useUser } from '@/api/user/user.hooks';
import EdgeCaseTemplate from '@/components/edge-case-template';
import Icon from '@/components/icon';
import { NotificationDetailsModal } from '@/components/modals/notification-details-modal';
import NotificationGroup from '@/components/notifications/notification-group';
import { type INotificationItem } from '@/components/notifications/notification-item/notification-item.interface';
import ScreenWrapper from '@/components/screen-wrapper';
import SkeletonLoader from '@/components/skeleton-loader';
import { colors, Text, useModal } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/assets/icons';
import { NoNotification } from '@/components/ui/assets/illustrations';
import { translate } from '@/core';

import dayjs from '../lib/dayjs';

export default function NotificationsScreen() {
  const notificationModal = useModal();

  const {
    i18n: { language },
  } = useTranslation();

  const { data: userInfo } = useUser(language);
  const { data: userNotifications, isPending: areUserNotificationsLoading } =
    useFetchUserNotifications({
      userId: userInfo?.userId,
      language,
    })();

  const { mutate: onMarkNotificationAsRead } = useMarkNotificationAsRead();

  const groupedNotifications = userNotifications?.notifications?.reduce(
    (groups: any, notification: INotificationItem) => {
      const date = dayjs(notification.createdAt).locale(language);
      const formattedDate = date.isSame(dayjs(), 'day')
        ? translate('weekDays.today')
        : date.isSame(dayjs().subtract(1, 'day'), 'day')
          ? translate('weekDays.yesterday')
          : date.format('MMMM D, YYYY');

      if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }
      groups[formattedDate].push(notification);

      return groups;
    },
    {}
  );

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-4 px-6">
          <Icon
            icon={<ArrowLeft />}
            iconContainerStyle="items-center p-2.5 justify-center rounded-full border-2 border-charcoal-800"
            size={24}
            color={colors.white}
            onPress={router.back}
          />
          <Text className="font-bold-poppins text-2xl text-white">
            Notifications
          </Text>
        </View>
        {areUserNotificationsLoading ? (
          <SkeletonLoader />
        ) : !userNotifications?.notifications?.length ? (
          <EdgeCaseTemplate
            image={<NoNotification />}
            title={translate(
              'rootLayout.screens.notifications.noNotifications'
            )}
            message="You have no notification right now. Come back later"
            additionalClassName="mt-[20%] px-16"
          />
        ) : (
          Object.entries(groupedNotifications)?.map(
            ([date, notifications], index) => (
              <NotificationGroup
                key={index}
                date={date}
                notifications={notifications as INotificationItem[]}
                onMarkNotificationAsRead={onMarkNotificationAsRead}
                onShowNotification={notificationModal.present}
              />
            )
          )
        )}

        <NotificationDetailsModal ref={notificationModal.ref} />
      </ScrollView>
    </ScreenWrapper>
  );
}
