import { type ReactNode } from 'react';

export interface IScreenHeader {
  // Left side props
  showBackButton?: boolean;
  onBackPress?: () => void;
  backButtonIcon?: ReactNode;
  backButtonSize?: number;

  // Title props
  title?: string;
  titleStyle?: string;

  // Right side props
  rightComponent?: ReactNode;

  // Container props
  containerStyle?: string;
  leftContainerStyle?: string;
  iconContainerStyle?: string;
  iconColor?: string;
}
