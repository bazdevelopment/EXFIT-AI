import React from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import { ArrowLeft, ArrowRight } from '../ui/assets/icons';

interface OnboardingNavigationProps {
  currentIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  className?: string;
  dotClassName?: string;
  buttonClassName?: string;
  onFinish?: () => void;
  isLastScreenDisplayed?: boolean;
}

interface DotIndicatorProps {
  isActive: boolean;
  index: number;
  className?: string;
}

const DotIndicator = ({
  isActive,
  index,
  className = '',
}: DotIndicatorProps) => {
  const animatedValue = React.useRef(
    new Animated.Value(isActive ? 1 : 0.5)
  ).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isActive ? 1.25 : 0.5,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isActive, animatedValue]);

  return (
    <Animated.View
      className={`mx-1 size-2 rounded-full ${className}`}
      style={{
        backgroundColor: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0.5, 1],
              outputRange: [1, 1.2],
            }),
          },
        ],
      }}
    />
  );
};

interface NavigationButtonProps {
  onPress: () => void;
  disabled?: boolean;
  direction: 'left' | 'right';
  className?: string;
}

const NavigationButton = ({
  onPress,
  disabled = false,
  direction,
  className = '',
}: NavigationButtonProps) => {
  const Icon = direction === 'left' ? ArrowLeft : ArrowRight;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`size-12 items-center justify-center rounded-full bg-black bg-opacity-30 ${
        disabled ? 'opacity-30' : ''
      } ${className}`}
      activeOpacity={0.8}
    >
      <Icon width={24} height={24} color="white" />
    </TouchableOpacity>
  );
};

export const OnboardingNavigation = ({
  currentIndex,
  totalSteps,
  onPrevious,
  onNext,
  canGoBack = true,
  canGoNext = true,
  className = '',
  dotClassName = '',
  buttonClassName = '',
  isLastScreenDisplayed = false,
  onFinish,
}: OnboardingNavigationProps) => {
  const isFirstStep = currentIndex === 0;

  return (
    <View
      className={`flex-row items-center justify-between px-6 py-4 ${className}`}
    >
      {/* Previous Button */}
      <NavigationButton
        onPress={onPrevious}
        disabled={isFirstStep || !canGoBack}
        direction="left"
        className={buttonClassName}
      />

      {/* Dot Indicators */}
      <View className="top-[-40px] flex-row items-center justify-center">
        {Array.from({ length: totalSteps }, (_, index) => (
          <DotIndicator
            key={index}
            isActive={index === currentIndex}
            index={index}
            className={dotClassName}
          />
        ))}
      </View>

      {/* Next Button */}
      <NavigationButton
        onPress={isLastScreenDisplayed ? onFinish : onNext}
        // disabled={isLastStep || !canGoNext}
        direction="right"
        className={buttonClassName}
      />
    </View>
  );
};
