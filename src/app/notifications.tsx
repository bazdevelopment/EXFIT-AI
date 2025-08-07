import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import {
  useFetchUserNotifications,
  useMarkNotificationAsRead,
} from '@/api/push-notifications/push-notifications.hooks';
import { useUser } from '@/api/user/user.hooks';
import UpgradeBanner from '@/components/banners/upgrade-banner';
import EdgeCaseTemplate from '@/components/edge-case-template';
import { NotificationDetailsModal } from '@/components/modals/notification-details-modal';
import NotificationGroup from '@/components/notifications/notification-group';
import { type INotificationItem } from '@/components/notifications/notification-item/notification-item.interface';
import ScreenHeader from '@/components/screen-header';
import ScreenWrapper from '@/components/screen-wrapper';
import SkeletonLoader from '@/components/skeleton-loader';
import { useModal } from '@/components/ui';
import { NoNotification } from '@/components/ui/assets/illustrations';
import { translate } from '@/core';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';

import dayjs from '../lib/dayjs';

export default function NotificationsScreen() {
  const notificationModal = useModal();
  const { isUpgradeRequired } = useSubscriptionAlert();

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
        <ScreenHeader title="Notifications" />
        {isUpgradeRequired && <UpgradeBanner additionalClassName="mt-4 mb-0" />}

        {areUserNotificationsLoading ? (
          <SkeletonLoader />
        ) : !userNotifications?.notifications?.length ? (
          <EdgeCaseTemplate
            image={<NoNotification width={350} height={350} />}
            title={translate(
              'rootLayout.screens.notifications.noNotifications'
            )}
            message="You have no notification right now. Come back later"
            additionalClassName="mt-[5%] px-16"
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
