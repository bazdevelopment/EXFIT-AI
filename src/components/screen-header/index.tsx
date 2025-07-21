import { router } from 'expo-router';
import { View } from 'react-native';

import Icon from '../icon';
import { colors, Text } from '../ui';
import { ArrowLeft } from '../ui/assets/icons';
import { type IScreenHeader } from './screen-header.interface';

const ScreenHeader = ({
  // Left side props
  showBackButton = true,
  onBackPress = () => router.back(),
  backButtonIcon = <ArrowLeft />,
  backButtonSize = 24,

  // Title props
  title,
  titleStyle = 'font-bold-poppins text-2xl text-white',

  // Right side props
  rightComponent,

  // Container props
  containerStyle = 'flex-row justify-between px-6',
  leftContainerStyle = 'flex-row items-center gap-4',
  iconContainerStyle = 'items-center p-2.5 self-start rounded-full border-2 border-charcoal-800',
  iconColor = colors.white,
}: IScreenHeader) => {
  return (
    <View className={containerStyle}>
      {/* Left Side */}
      <View className={leftContainerStyle}>
        {showBackButton && (
          <Icon
            icon={backButtonIcon}
            iconContainerStyle={iconContainerStyle}
            size={backButtonSize}
            color={iconColor}
            onPress={onBackPress}
          />
        )}
        {title && <Text className={titleStyle}>{title}</Text>}
      </View>

      {/* Right Side */}
      {rightComponent || null}
    </View>
  );
};

export default ScreenHeader;
