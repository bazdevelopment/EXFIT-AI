import React from 'react';

import { Feed as FeedIcon, Settings } from '@/components/ui/assets/icons';
import ActivityIcon from '@/components/ui/assets/icons/activity';
import ProgressIcon from '@/components/ui/assets/icons/progress';
import { translate } from '@/core/i18n';

import { type ITabsNavigationScreen } from './tabs.interface';

export const tabScreens: ITabsNavigationScreen[] = [
  {
    id: 1,
    screenName: 'index',
    title: translate('home.tab'),
    tabBarTestID: 'home-tab',
    icon: (color: string, focused: boolean) => (
      <FeedIcon color={color} focused={focused} width={24} height={24} />
    ),
    header: false,
  },
  {
    id: 2,
    screenName: 'activity',
    title: translate('activity.tab'),
    tabBarTestID: 'activity-tab',
    icon: (color: string, focused: boolean) => (
      <ActivityIcon color={color} focused={focused} width={24} height={24} />
    ),
    header: true,
  },
  {
    id: 3,
    screenName: 'progress',
    title: translate('progress.tab'),
    tabBarTestID: 'progress-tab',
    icon: (color: string, focused: boolean) => (
      <ProgressIcon color={color} focused={focused} width={24} height={24} />
    ),
    header: true,
  },
  {
    id: 4,
    screenName: 'settings',
    title: translate('settings.tab'),
    tabBarTestID: 'settings-tab',
    icon: (color: string, focused: boolean) => (
      <Settings color={color} focused={focused} />
    ),
    header: true,
  },
];
