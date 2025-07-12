/* eslint-disable max-lines-per-function */
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Linking, View } from 'react-native';

import { useScanImage } from '@/api/scan/scan.hooks';
import { useUser } from '@/api/user/user.hooks';
import CameraCaptureButton from '@/components/camera-capture-button';
import FadeInView from '@/components/fade-in-view/fade-in-view';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import { Button, colors, Text } from '@/components/ui';
import {
  ArrowLeft,
  FlashCameraOff,
  FlashCameraOn,
  RetakeIcon,
  SettingsWheelIcon,
} from '@/components/ui/assets/icons';
import { DEVICE_TYPE, useSelectedLanguage } from '@/core';
import { createFormDataImagePayload } from '@/core/utilities/create-form-data-image-payload';

import { Camera as CameraIcon } from '../../components/ui/assets/icons';

const { width, height } = Dimensions.get('window');

interface CameraScanScreenProps {}

const Scan: React.FC<CameraScanScreenProps> = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashMode, setFlashMode] = useState('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // const [isScanning, setIsScanning] = useState(false);
  const cameraRef = useRef(null);
  const scanningLottieRef = useRef<LottieView>(null);
  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

  const onSuccess = ({ conversationId }: { conversationId: string }) => {
    retakePhoto();
    router.navigate({
      pathname: '/chat-screen',
      params: {
        conversationId,
        mediaSource: capturedImage,
        mimeType: 'image/jpeg',
        conversationMode: 'IMAGE_SCAN_CONVERSATION',
      },
    });
  };

  const imagePayload = createFormDataImagePayload({
    fileUri: capturedImage as string,
    fileMimeType: 'image/jpeg',
    promptMessage: '',
    userId: userInfo.userId,
  });

  const {
    mutate: onScanImage,
    error: errorAnalyzeImage,
    isPending: isScanning,
  } = useScanImage({
    onSuccessCallback: onSuccess,
    language,
    // handleCloseScanningModal,
    // resetFlow,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <CameraIcon width={64} height={64} color="white" />
          <Text className="mt-4 text-center font-medium-poppins text-base text-white">
            Camera access is required to use this feature
          </Text>
          <Button
            label="Open settings"
            icon={
              <SettingsWheelIcon width={22} height={22} color={colors.black} />
            }
            className="mt-6 h-[42px] rounded-xl disabled:bg-[#7A7A7A]"
            textClassName="text-white dark:text-black disabled:text-white font-medium-poppins text-base"
            onPress={() =>
              DEVICE_TYPE.IOS
                ? Linking.openURL('App-Prefs:Camera')
                : Linking.openSettings()
            }
            disabled={isScanning}
          />
          <Button
            label="Go back"
            icon={<ArrowLeft width={22} height={22} color={colors.white} />}
            iconPosition="left"
            className="h-[40px] gap-2 rounded-xl active:opacity-80 disabled:bg-[#7A7A7A] dark:bg-transparent"
            textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
            onPress={router.back}
            disabled={isScanning}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Camera View */}
      {!capturedImage && (
        <CameraView
          ref={cameraRef}
          className="flex-1"
          facing={'back'}
          flash={flashMode}
          style={{ flex: 1 }}
        />
      )}

      <View className="absolute top-2 w-full flex-row items-center justify-between px-6 pt-14">
        <Icon
          size={24}
          containerStyle="rounded-full bg-charcoal-800/40 p-3"
          onPress={() => {
            router.back();
            retakePhoto();
          }}
          icon={<ArrowLeft color={colors.white} />}
        />

        {!capturedImage && (
          <View className="flex-row space-x-4">
            <Icon
              icon={flashMode === 'on' ? <FlashCameraOn /> : <FlashCameraOff />}
              iconContainerStyle="p-3  bg-charcoal-800/40  rounded-full"
              onPress={toggleFlash}
            />
          </View>
        )}
      </View>

      {/* Scanning Overlay */}
      <ScanningOverlay
        capturedImage={capturedImage}
        scanningLottieRef={scanningLottieRef}
        isScanning={isScanning}
      />

      {/* Bottom Controls */}
      <View className="absolute inset-x-0 bottom-0 px-6 pb-8">
        {!capturedImage ? (
          // Capture Button
          <CameraCaptureButton
            additionalClassName="bottom-10"
            onPress={takePicture}
          />
        ) : (
          <View className="bottom-10 flex-row items-center justify-between gap-4">
            <Button
              label="Retake"
              icon={<RetakeIcon width={22} height={22} />}
              className="h-[40px] flex-1 rounded-xl disabled:bg-[#7A7A7A]  dark:bg-transparent"
              textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
              onPress={retakePhoto}
              disabled={isScanning}
            />
            <FadeInView delay={100} className="flex-1">
              <Button
                label={'Continue ✨'}
                className="h-[40px] flex-1 rounded-full bg-[#4E52FB] disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
                onPress={() => onScanImage(imagePayload)}
                disabled={isScanning}
              />
            </FadeInView>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Scan;

const ScanningOverlay = ({ capturedImage, isScanning }) => (
  <View className="absolute inset-0  items-center justify-center">
    {/* Scanning Frame */}
    <View className="relative">
      {/* Corner Brackets */}
      {!isScanning && (
        <>
          <View className="absolute -left-4 -top-4 size-20 rounded-tl-[30px] border-l-[6px] border-t-[6px] border-white" />
          <View className="absolute -right-4 -top-4 size-20 rounded-tr-[30px] border-r-[6px]  border-t-[6px] border-white" />
          <View className="absolute -bottom-4 -left-4 size-20 rounded-bl-[30px] border-b-[6px] border-l-[6px] border-white" />
          <View className="absolute -bottom-4 -right-4 size-20 rounded-br-[30px] border-b-[6px] border-r-[6px] border-white" />
        </>
      )}

      {/* Scanning Area */}

      <View
        className="rounded-2xl bg-transparent"
        style={{ width: width * 0.75, height: height * 0.55 }}
      >
        {/* Instructions */}
        {!capturedImage && !isScanning ? (
          <View className="-top-[80px] rounded-full bg-charcoal-800/40 p-2 ">
            <Text className="text-center text-sm text-white">
              You can scan anything related to your physical activity
            </Text>
          </View>
        ) : isScanning ? (
          <View className="-top-[80px] justify-center self-center rounded-full bg-charcoal-800/40 p-2 px-6">
            <Text className="text-center text-sm text-white">Scanning...</Text>
          </View>
        ) : null}
        {/* Scanning Line Animation */}
        {isScanning && (
          // <View style={{ width: width * 1, height: height * 0.5 }}>
          <LottieView
            source={require('assets/lottie/scan-effect.json')}
            autoPlay
            loop
            style={{
              position: 'absolute',
              inset: 0,
              transform: [{ scale: 1.75 }],
              // width: 100,
              zIndex: 10,
            }}
          />
          // </View>
        )}
      </View>

      {/* Captured Image */}
      {capturedImage && (
        <Image
          source={{ uri: capturedImage }}
          className="absolute rounded-2xl"
          style={{ width: width * 0.75, height: height * 0.55 }}
          resizeMode="cover"
        />
      )}
    </View>
  </View>
);
