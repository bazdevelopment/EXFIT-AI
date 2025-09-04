import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from 'react-native';

import { Text } from '../ui';
/**
 * !very important: import TouchableOpacity from '@gorhom/bottom-sheet';, it solves the issue for pressing buttons in bottom sheet modals on android
 */
const CustomBottomSheetButton = ({
  onPress,
  disabled = false,
  loading = false,
  label = 'Add Activity',
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={{
        height: 44,
        width: '100%',
        borderRadius: 20, // Full rounded (height/2)
        backgroundColor: isDisabled ? '#7A7A7A' : '#4E52FB',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color="white"
          style={{ marginRight: 8 }}
        />
      )}
      <Text className="font-medium-poppins text-base">{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomBottomSheetButton;
