/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Image, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import { CloseIcon } from '@/components/ui/assets/icons';

const { width, height } = Dimensions.get('window');

interface CameraScanScreenProps {}

const Scan: React.FC<CameraScanScreenProps> = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const cameraRef = useRef(null);
  const scanningLottieRef = useRef<LottieView>(null);

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

  const startScanning = () => {
    setIsScanning(true);
    setScanProgress(0);
    scanningLottieRef.current?.play();

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          Alert.alert('Scan Complete', 'Product scanned successfully!');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsScanning(false);
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
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Ionicons name="camera-outline" size={64} color="white" />
        <Text className="mt-4 text-center text-lg text-white">
          Camera permission is required to scan products
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
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

      <View className="absolute top-2 w-full flex-row items-center justify-between px-6  pt-12">
        <TouchableOpacity className="p-2" onPress={router.back}>
          <CloseIcon color="white" width={25} height={25} />
        </TouchableOpacity>

        {!capturedImage && (
          <View className="flex-row space-x-4">
            <TouchableOpacity className="p-2" onPress={toggleFlash}>
              <Ionicons
                name={flashMode === 'on' ? 'flash' : 'flash-off'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Scanning Overlay */}
      <ScanningOverlay
        capturedImage={capturedImage}
        scanningLottieRef={scanningLottieRef}
        isScanning={isScanning}
        scanProgress={scanProgress}
      />

      {/* Bottom Controls */}
      <View className="absolute inset-x-0 bottom-0 px-6 pb-8">
        {!capturedImage ? (
          // Capture Button
          <View className="bottom-10 items-center">
            <TouchableOpacity
              onPress={takePicture}
              className="size-20 items-center justify-center rounded-full border-4 border-gray-300 bg-white"
              activeOpacity={0.8}
            >
              <View className="size-16 rounded-full bg-white shadow-lg" />
            </TouchableOpacity>
          </View>
        ) : (
          // Confirm/Retake Buttons
          <View className="bottom-10 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={retakePhoto}
              className="mr-3 flex-1 items-center rounded-xl bg-gray-800 py-4"
              disabled={isScanning}
            >
              <Text className="text-lg font-semibold text-white">Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={startScanning}
              className="ml-3 flex-1 items-center rounded-xl bg-blue-600 py-4"
              disabled={isScanning}
            >
              <Text className="text-lg font-semibold text-white">
                {isScanning ? 'Scanning...' : 'Scan Product'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default Scan;

const ScanningOverlay = ({ capturedImage, isScanning, scanProgress }) => (
  <View className="absolute inset-0 -top-12 items-center justify-center">
    {/* Scanning Frame */}
    <View className="relative">
      {/* Corner Brackets */}
      {!isScanning && (
        <>
          <View className="absolute -left-4 -top-4 size-8 rounded-tl-lg border-l-4 border-t-4 border-white" />
          <View className="absolute -right-4 -top-4 size-8 rounded-tr-lg border-r-4 border-t-4 border-white" />
          <View className="absolute -bottom-4 -left-4 size-8 rounded-bl-lg border-b-4 border-l-4 border-white" />
          <View className="absolute -bottom-4 -right-4 size-8 rounded-br-lg border-b-4 border-r-4 border-white" />
        </>
      )}

      {/* Scanning Area */}
      <View
        className="rounded-2xl bg-transparent"
        style={{ width: width * 0.7, height: height * 0.5 }}
      >
        {/* Scanning Line Animation */}
        {capturedImage && isScanning && (
          // <View style={{ width: width * 1, height: height * 0.5 }}>
          <LottieView
            source={require('assets/lottie/scan-animation.json')}
            autoPlay
            loop
            style={{
              position: 'absolute',
              inset: 0,
              transform: [{ scale: 1.8 }],
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
          style={{ width: width * 0.7, height: height * 0.5 }}
          resizeMode="cover"
        />
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <View className="absolute inset-x-0 -bottom-16 items-center">
          <Text className="mb-2 text-lg font-semibold text-white">
            Scanning...{Math.round(scanProgress)}%
          </Text>
          <View className="h-2 w-48 overflow-hidden rounded-full bg-gray-700">
            <View
              className="h-full rounded-full bg-blue-500 transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </View>
        </View>
      )}
    </View>

    {/* Instructions */}
    {!capturedImage && !isScanning && (
      <Text className="mt-8 px-6 text-center text-base text-white">
        Position the product within the frame to scan
      </Text>
    )}
  </View>
);
