import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, View } from 'react-native';

import { colors, Image, Text } from '@/components/ui';

const ActivityPromptBanner = ({
  containerClassName,
}: {
  containerClassName: string;
}) => {
  return (
    <View
      className={`w-[90%] self-center overflow-hidden rounded-3xl shadow-lg ${containerClassName}`}
    >
      <LinearGradient
        colors={[colors.black, '#316DFD']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Main Flex Container: This is the key change for the layout */}
        <View className="flex-row items-center justify-between p-4">
          {/* Left Column: Contains all text and buttons */}
          <View className="w-[75%]">
            {/* Daily Check-in Pill */}
            <View className="flex-row items-center self-start rounded-full bg-black/20 px-3 py-1.5">
              <Text>📅</Text>
              <Text className="ml-2 text-xs font-bold text-white">
                Daily check-in
              </Text>
            </View>

            {/* Middle Content */}
            <View className="mt-1">
              <Text className="te font-bold-nunito text-lg text-white">
                Have you done any fitness activities today?
              </Text>
            </View>

            {/* Bottom Buttons */}
            <View className="mt-4 flex-row gap-4">
              <TouchableOpacity className="flex-1 items-center justify-center rounded-xl bg-white/20 p-2 active:bg-white/30">
                <Text className="text-base font-bold text-white">Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 items-center justify-center rounded-xl bg-white/20 p-2 active:bg-white/30">
                <Text className="text-base font-bold text-white">No</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column: Contains the image */}
          <View className="w-2/5">
            <Image
              source={require('../../../components/ui/assets/images/male-female.png')}
              className="size-36 rounded-2xl "
              style={{
                resizeMode: 'cover',
                marginLeft: -5,
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
export default ActivityPromptBanner;
