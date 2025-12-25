import React from 'react';

import { colors } from '@/components/ui';
import {
  CalendarIcon,
  Feed as FeedIcon,
  Settings,
} from '@/components/ui/assets/icons';
import { ChatIcon } from '@/components/ui/assets/icons/chat-icon';
import ScanIcon from '@/components/ui/assets/icons/scan';
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
    screenName: 'chat',
    title: 'chat',
    tabBarTestID: 'chat-tab',
    icon: (color: string, focused: boolean) => (
      <ChatIcon color={color} focused={focused} width={30} height={30} />
    ),
    header: false,
  },
  {
    id: 4,
    screenName: 'scan',
    title: 'Scan',
    tabBarTestID: 'scan-tab',
    icon: (color: string, focused: boolean) => (
      <ScanIcon color={colors.white} focused={focused} width={35} height={35} />
    ),
    header: false,
  },
  {
    id: 3,
    screenName: 'activity',
    title: translate('activity.tab'),
    tabBarTestID: 'activity-tab',
    icon: (color: string, focused: boolean) => (
      <CalendarIcon color={color} focused={focused} width={24} height={24} />
    ),
    header: false,
  },

  // {
  //   id: 4,
  //   screenName: 'progress',
  //   title: translate('progress.tab'),
  //   tabBarTestID: 'progress-tab',
  //   icon: (color: string, focused: boolean) => (
  //     <ProgressIcon color={color} focused={focused} width={24} height={24} />
  //   ),
  //   header: false,
  // },

  {
    id: 5,
    screenName: 'settings',
    title: translate('settings.tab'),
    tabBarTestID: 'settings-tab',
    icon: (color: string, focused: boolean) => (
      <Settings color={color} focused={focused} />
    ),
    header: false,
  },
];
