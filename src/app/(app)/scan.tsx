/* eslint-disable max-lines-per-function */
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { firebaseAuth } from 'firebase/config';
import { generateUniqueId } from 'functions/utilities/generate-unique-id';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, Linking, View } from 'react-native';

import {
  useAllUserConversations,
  useSendStreamingMessage,
} from '@/api/conversation/conversation.hooks';
import CameraCaptureButton from '@/components/camera-capture-button';
import CustomAlert from '@/components/custom-alert';
import FadeInView from '@/components/fade-in-view/fade-in-view';
import Icon from '@/components/icon';
import ScreenWrapper from '@/components/screen-wrapper';
import Toast from '@/components/toast';
import { Button, colors, Text } from '@/components/ui';
import {
  ArrowLeft,
  CloseIcon,
  FlashCameraOff,
  FlashCameraOn,
  RetakeIcon,
  RetryIcon,
  SettingsWheelIcon,
} from '@/components/ui/assets/icons';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import useRemoteConfig from '@/core/hooks/use-remote-config';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';

import { Camera as CameraIcon } from '../../components/ui/assets/icons';

const { width, height } = Dimensions.get('window');

interface CameraScanScreenProps {}

const Scan: React.FC<CameraScanScreenProps> = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashMode, setFlashMode] = useState('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { language: appLanguage } = useSelectedLanguage();

  const cameraRef = useRef(null);
  const scanningLottieRef = useRef<LottieView>(null);

  const { MAX_CONVERSATIONS_ALLOWED_FREE_TRIAL } = useRemoteConfig();

  const { data } = useAllUserConversations();
  const conversationsCount = data?.count || 0;

  const { isUpgradeRequired } = useSubscriptionAlert();
  const userId = firebaseAuth.currentUser?.uid as string;

  const conversationId = generateUniqueId();

  const onSuccess = ({ conversationId }: { conversationId: string }) => {
    retakePhoto();
    router.navigate({
      pathname: '/chat-screen',
      params: {
        conversationId,
        mediaSource: capturedImage?.uri!,
        mimeType: 'image/jpeg',
        conversationMode: 'IMAGE_SCAN_CONVERSATION',
      },
    });
  };

  // const imagePayload = createFormDataImagePayload({
  //   fileUri: capturedImage as string,
  //   fileMimeType: 'image/jpeg',
  //   promptMessage: '',
  //   userId: userInfo.userId,
  // });

  // const {
  //   mutate: onScanImage,
  //   error: errorAnalyzeImage,
  //   isPending: isScanning,
  //   reset: resetOnScanImage,
  // } = useScanImage({
  //   onSuccessCallback: onSuccess,
  //   language,
  //   // handleCloseScanningModal,
  //   // resetFlow,
  // });

  const {
    mutateAsync: onScanImage,
    isPending: isScanning,
    error: errorAnalyzeImage,
    reset: resetOnScanImage,
  } = useSendStreamingMessage({
    onComplete: onSuccess,
    onError: () => {},
  });

  const handleScanImage = async () => {
    if (
      isUpgradeRequired &&
      conversationsCount >= MAX_CONVERSATIONS_ALLOWED_FREE_TRIAL
    ) {
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
    // onScanImage(imagePayload);
    await onScanImage({
      //!! add a prompt in this screen
      // userMessage: !!promptMessage?.trim()
      //   ? promptMessage
      //   : !!imageDataArray?.length
      //     ? translate('general.analyzingMediaFilesPlaceholder')
      //     : '',
      userMessage: '', //!todo add a prompt input in this screen
      conversationId,
      userId,
      history: [],
      mediaFiles: [
        {
          uri: capturedImage?.uri || '',
          mimeType: capturedImage?.fileMimeType || '',
          fileName: capturedImage?.fileName || '',
        },
      ],

      language: appLanguage,
      onStream: (chunk: string) => {},
      onComplete: (fullResponse: string) => {},
      onError: (error: Error) => {
        // console.error('Error sending message:', error);
        Toast.error(translate('alerts.failedSendMessage'));
      },
    });
  };

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
        setCapturedImage(photo);
      } catch (error) {
        Alert.alert(
          translate('general.error'),
          translate('alerts.capturePictureFailed')
        );
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
        <Text className="text-white">
          {translate('rootLayout.screens.scan.requestPermission')}
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <ScreenWrapper>
        <View className="flex-1 items-center justify-center px-6">
          <CameraIcon width={64} height={64} color="white" />
          <Text className="mt-4 text-center font-medium-poppins text-base text-white">
            {translate('rootLayout.screens.scan.cameraPermission')}
          </Text>
          <Button
            label={translate('general.openSettings')}
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
            label={translate('general.goBack')}
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
    <View className="flex-1">
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

      <View
        className={`absolute top-2 w-full flex-row items-center justify-between px-6 ${DEVICE_TYPE.IOS ? 'pt-14' : 'pt-4'}`}
      >
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
        {/* Capture or Action Buttons */}
        {!capturedImage && !errorAnalyzeImage && (
          <CameraCaptureButton
            additionalClassName="bottom-10"
            onPress={takePicture}
          />
        )}

        {capturedImage && !errorAnalyzeImage && (
          <View className="bottom-10 flex-row items-center justify-between gap-4">
            <Button
              label={translate('general.retake')}
              icon={<RetakeIcon width={22} height={22} />}
              className="h-[40px] flex-1 rounded-xl disabled:bg-[#7A7A7A] dark:bg-transparent"
              textClassName="text-white dark:text-white disabled:text-white font-medium-poppins text-base"
              onPress={retakePhoto}
              disabled={isScanning}
            />
            <FadeInView delay={100} className="flex-1">
              <Button
                className="h-auto flex-1 rounded-full bg-[#4E52FB] py-2 disabled:bg-[#7A7A7A] dark:bg-[#4E52FB]"
                onPress={handleScanImage}
                disabled={isScanning}
              >
                <Text
                  className="text-center font-medium-poppins text-base text-white"
                  numberOfLines={2}
                >
                  {`${translate('general.scanNow')} ✨`}
                </Text>
              </Button>
            </FadeInView>
          </View>
        )}

        {/* Error State */}
        {errorAnalyzeImage && (
          <View className="flex-column mt-10 gap-5">
            <View className="justify-center gap-5">
              <Button
                variant="default"
                label={translate('general.retry')}
                onPress={handleScanImage}
                className="h-12 min-w-[200] rounded-xl border-2 border-primary-900 bg-black active:opacity-80 dark:bg-black"
                textClassName="text-white dark:text-white"
                disabled={isScanning}
                icon={<RetryIcon color={colors.white} width={18} height={18} />}
              />
              <Button
                label={translate('general.close')}
                onPress={() => {
                  resetOnScanImage();
                  setCapturedImage(null);
                  router.back();
                }}
                variant="default"
                className="w-[100] justify-center self-center rounded-full bg-black active:opacity-80 dark:bg-white"
                textClassName="text-white dark:text-black"
                disabled={isScanning}
                icon={<CloseIcon color={colors.black} width={18} height={18} />}
              />
            </View>
          </View>
        )}

        {/* Uncomment if needed
  {error && (
    <Text className="text-center text-danger-400 dark:text-danger-400">
      {error.toString()}
    </Text>
  )}
  */}
      </View>
    </View>
  );
};

export default Scan;

const ScanningOverlay = ({ capturedImage, isScanning }) => (
  <View className="absolute inset-0 -top-10  items-center justify-center">
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
            <Text className="text-center font-medium-poppins text-sm text-white">
              {translate('rootLayout.screens.scan.scanAnything')}
            </Text>
          </View>
        ) : isScanning ? (
          <View className="-top-[80px] justify-center self-center rounded-full bg-charcoal-800/40 p-2 px-6">
            <Text className="text-center text-sm text-white">
              {translate('general.scanning')}
            </Text>
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
      {!!capturedImage?.uri && (
        <Image
          source={{ uri: capturedImage.uri }}
          className="absolute rounded-2xl"
          style={{ width: width * 0.75, height: height * 0.55 }}
          resizeMode="cover"
        />
      )}
    </View>
  </View>
);
