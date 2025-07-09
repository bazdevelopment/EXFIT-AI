import { router } from 'expo-router';
import { generateUniqueId } from 'functions/utilities/generate-unique-id';
import { View } from 'react-native';

import { Button, colors, Text } from '@/components/ui';
import { QuestionChat } from '@/components/ui/assets/icons';

const AICoachBanner = ({
  containerClassName,
}: {
  containerClassName?: string;
}) => {
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
          <Text className="text-lg font-bold leading-tight text-white">
            Got a Question? Just Ask.
          </Text>

          <Text className="mt-2 text-sm text-gray-300">
            Master your fitness—ask about gym machines, poses, injuries, form,
            training plans
          </Text>

          <View className="mt-2">
            <Button
              label="Chat with AI Coach"
              className="h-[34px] rounded-full bg-white active:bg-gray-200"
              textClassName="text-black font-bold"
              onPress={() =>
                router.navigate({
                  pathname: '/chat-screen',
                  params: {
                    conversationId: generateUniqueId(),
                    mediaSource: '',
                    mimeType: '',
                    conversationMode: 'RANDOM_CONVERSATION',
                  },
                })
              }
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default AICoachBanner;
