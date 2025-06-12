import { TouchableOpacity, View } from 'react-native';

import { Image, Text } from '@/components/ui';

const AICoachBanner = ({
  containerClassName,
}: {
  containerClassName?: string;
}) => {
  return (
    // Main Container: Black background with large rounded corners and a subtle border
    <View
      className={`w-[95%] max-w-lg self-center overflow-hidden rounded-[32px] border border-gray-800 bg-black shadow-lg ${containerClassName}`}
    >
      {/* Main Flexbox row to align items */}
      <View className="flex-row items-center">
        {/* Left Column: Contains text and button */}
        <View className="flex-1 p-6">
          <Text className="font-semibold-nunito  text-white">
            Ask Joe AI, your fitness coach everything regarding your goals,
            routine and recommendations.
          </Text>

          <TouchableOpacity className="mt-8 self-start rounded-full bg-stone-300 px-8 py-3 active:bg-stone-400">
            <Text className="text-base font-bold text-[#3195FD]">Chat now</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require('../../../components/ui/assets/images/brain-ai.png')}
          className="size-40"
          style={{
            resizeMode: 'cover',
          }}
        />
      </View>
    </View>
  );
};
export default AICoachBanner;
