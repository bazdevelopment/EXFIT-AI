/* eslint-disable max-lines-per-function */
// import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CheckIcon, EditIcon } from '../ui/assets/icons';

interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: 'small' | 'medium' | 'large';
  showEditBadge?: boolean;
  showVerifiedBadge?: boolean;
  onImageChange?: (uri: string) => void;
  onEditPress?: () => void;
  editable?: boolean;
  creationDate?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name = 'Caption Cool',
  imageUri,
  size = 'large',
  showEditBadge = true,
  showVerifiedBadge = false,
  onImageChange,
  onEditPress,
  editable = true,
  creationDate,
}) => {
  const [currentImageUri, setCurrentImageUri] = useState<string | undefined>(
    imageUri
  );

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-12 h-12',
      badge: 'w-4 h-4',
      badgePosition: '-bottom-0.5 -right-0.5',
      icon: 12,
    },
    medium: {
      container: 'w-20 h-20',
      badge: 'w-6 h-6',
      badgePosition: '-bottom-1 -right-1',
      icon: 16,
    },
    large: {
      container: 'w-24 h-24',
      badge: 'w-8 h-8',
      badgePosition: '-bottom-1 -right-1',
      icon: 20,
    },
  };

  const config = sizeConfig[size];

  // Request permissions
  const requestPermissions = async () => {
    // const { status: cameraStatus } =
    //   await ImagePicker.requestCameraPermissionsAsync();
    // const { status: mediaStatus } =
    //   await ImagePicker.requestMediaLibraryPermissionsAsync();
    // if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
    //   Alert.alert(
    //     'Permissions Required',
    //     'Please grant camera and photo library permissions to change your avatar.',
    //     [{ text: 'OK' }]
    //   );
    //   return false;
    // }
    // return true;
  };

  // Take photo with camera
  const takePhoto = async () => {
    // const hasPermission = await requestPermissions();
    // if (!hasPermission) return;
    // const result = await ImagePicker.launchCameraAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 0.8,
    // });
    // if (!result.canceled && result.assets[0]) {
    //   const newUri = result.assets[0].uri;
    //   setCurrentImageUri(newUri);
    //   onImageChange?.(newUri);
    // }
  };

  // Pick from gallery
  const pickFromGallery = async () => {
    // const hasPermission = await requestPermissions();
    // if (!hasPermission) return;
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsEditing: true,
    //   aspect: [1, 1],
    //   quality: 0.8,
    // });
    // if (!result.canceled && result.assets[0]) {
    //   const newUri = result.assets[0].uri;
    //   setCurrentImageUri(newUri);
    //   onImageChange?.(newUri);
    // }
  };

  // Remove avatar
  const removeAvatar = () => {
    Alert.alert(
      'Remove Avatar',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCurrentImageUri(undefined);
            onImageChange?.('');
          },
        },
      ]
    );
  };

  // Show action sheet
  const showActionSheet = () => {
    if (!editable) return;

    const options = ['Take Photo', 'Choose from Gallery'];
    if (currentImageUri) {
      options.push('Remove Avatar');
    }
    options.push('Cancel');

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: currentImageUri ? 2 : undefined,
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              takePhoto();
              break;
            case 1:
              pickFromGallery();
              break;
            case 2:
              if (currentImageUri) removeAvatar();
              break;
          }
        }
      );
    } else {
      // Android - show custom alert
      Alert.alert('Change Avatar', 'Choose an option', [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        ...(currentImageUri
          ? [
              {
                text: 'Remove Avatar',
                onPress: removeAvatar,
                style: 'destructive' as const,
              },
            ]
          : []),
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // Get initials for fallback
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View className="items-center">
      <View className="relative">
        <TouchableOpacity
          onPress={editable ? showActionSheet : onEditPress}
          activeOpacity={0.8}
          className={`${config.container} items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700`}
        >
          {currentImageUri ? (
            <Image
              source={{ uri: currentImageUri }}
              className="size-full"
              resizeMode="cover"
            />
          ) : (
            <View className="size-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600">
              <Text className="text-lg font-bold text-white">
                {getInitials(name)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Edit Badge */}
        {showEditBadge && editable && (
          <TouchableOpacity
            onPress={showActionSheet}
            className={`absolute ${config.badgePosition} ${config.badge} items-center justify-center rounded-full border-2 border-white bg-blue-500 dark:border-gray-900 dark:bg-blue-600`}
          >
            <EditIcon size={config.icon} color="white" />
          </TouchableOpacity>
        )}

        {/* Verified Badge */}
        {showVerifiedBadge && (
          <View
            className={`absolute ${config.badgePosition} ${config.badge} items-center justify-center rounded-full border-2 border-white bg-green-500 dark:border-gray-900`}
          >
            <CheckIcon size={config.icon} color="white" />
          </View>
        )}
      </View>
      <Text className="mb-2 mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        {name}
      </Text>
      <Text className="text-sm text-gray-400 dark:text-gray-500">
        Joined {creationDate}
      </Text>
    </View>
  );
};

export default Avatar;
