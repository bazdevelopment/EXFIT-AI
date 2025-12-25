import { router } from 'expo-router';
import { generateUniqueId } from 'functions/utilities/generate-unique-id';
import { View } from 'react-native';

import CustomAlert from '@/components/custom-alert';
import Toast from '@/components/toast';
import { Button, colors, Text } from '@/components/ui';
import { QuestionChat } from '@/components/ui/assets/icons';
import { translate } from '@/core';

const AICoachBanner = ({
  containerClassName,
  showUpgradeBanner,
}: {
  containerClassName?: string;
  showUpgradeBanner: boolean;
}) => {
  const handleGoToChatScreen = () => {
    if (showUpgradeBanner) {
      return Toast.showCustomToast(
        <CustomAlert
          title={`${translate('general.dearUser')},`}
          subtitle={translate('components.UpgradeBanner.upgradeMessage')}
          buttons={[
            {
              label: translate('components.UpgradeBanner.heading'),
              variant: 'default',
              onPress: () => router.navigate('/paywall-new'),
              buttonTextClassName: 'dark:text-white',
              className:
                'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
            },
          ]}
        />,
        {
          duration: 10000000,
        }
      );
    }
    router.navigate({
      pathname: '/chat-screen',
      params: {
        conversationId: generateUniqueId(),
        mediaSource: '',
        mimeType: '',
        conversationMode: 'RANDOM_CONVERSATION',
      },
    });
  };
  return (
    <View
      className={`w-full self-center overflow-hidden rounded-3xl bg-[#2A2D3A] shadow-lg ${containerClassName}`}
    >
      <View className="flex-row items-center p-3">
        {/* Question Icon */}
        <View className="mr-4 h-full w-[80px] flex-row items-center justify-center rounded-xl bg-[#191A21]">
          <QuestionChat width={40} height={40} fill={colors.white} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-md font-semibold-poppins text-white">
            {translate('components.AICoachBanner.title')}
          </Text>

          <Text className="mt-2 text-sm text-gray-300">
            {translate('components.AICoachBanner.subtitle')}
          </Text>

          <View className="mt-2">
            <Button
              label={translate('components.AICoachBanner.chat')}
              className="h-[34px] rounded-full bg-white active:bg-gray-200"
              textClassName="text-black font-medium-poppins"
              onPress={handleGoToChatScreen}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default AICoachBanner;
