import { LinearGradient } from 'expo-linear-gradient';
import React, { type ReactElement } from 'react';
import type { PressableProps } from 'react-native';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

import GradientText from '@/components/gradient-text';

import colors from './colors';

const button = tv({
  slots: {
    container: 'my-2 flex-row items-center justify-center rounded-md px-4',
    label: 'font-semibold-poppins text-base',
    indicator: 'h-6 text-white dark:text-white',
  },

  variants: {
    variant: {
      default: {
        container: 'bg-black dark:bg-white',
        label: 'text-white dark:text-black',
        indicator: 'text-white dark:text-black',
      },
      secondary: {
        container: 'bg-primary-900',
        label: 'text-secondary-600',
        indicator: 'text-white',
      },
      outline: {
        container: 'border border-neutral-400',
        label: 'text-black dark:text-neutral-100',
        indicator: 'text-black dark:text-neutral-100',
      },
      destructive: {
        container:
          'rounded-xl border-[1.5px] border-red-100 bg-red-500 dark:border-0 dark:bg-red-600',
        label: 'text-white',
        indicator: 'text-white',
      },
      ghost: {
        container: 'bg-transparent',
        label: 'text-black underline dark:text-white',
        indicator: 'text-black dark:text-white',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-black active:opacity-80',
        indicator: 'text-black',
      },
      gradient: {
        container: 'bg-transparent', // Remove background when using gradient
        label: 'text-white',
        indicator: 'text-white',
      },
    },
    size: {
      default: {
        container: 'h-10 px-4',
        label: 'text-base',
      },
      lg: {
        container: 'h-14 px-8',
        label: 'text-xl',
      },
      sm: {
        container: 'h-8 px-3',
        label: 'text-sm',
        indicator: 'h-2',
      },
      icon: { container: 'size-9' },
    },
    disabled: {
      true: {
        container: 'disabled:border-neutral-200 disabled:bg-primary-600',
        label: 'text-neutral-600 dark:text-neutral-600',
        indicator: 'text-neutral-400 dark:text-neutral-400',
      },
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    disabled: false,
    fullWidth: true,
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof button>;
interface Props extends ButtonVariants, Omit<PressableProps, 'disabled'> {
  label?: string;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  loadingAnimationColor?: string;
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
  withGradientText?: boolean;
  withGradientBackground?: boolean;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  gradientLocations?: number[];
}

export const Button = React.forwardRef<View, Props>(
  (
    {
      label: text,
      loading = false,
      variant = 'default',
      disabled = false,
      size = 'default',
      className = '',
      icon,
      testID,
      loadingAnimationColor = colors.white,
      textClassName = '',
      withGradientText = false,
      withGradientBackground = false,
      gradientColors = ['#3195FD', '#8B5CF6'], // Default blue to purple
      gradientStart = { x: 0.1, y: 1 },
      gradientEnd = { x: 1.5, y: 0 },
      gradientLocations,
      iconPosition = 'right',
      ...props
    },
    ref
  ) => {
    const styles = React.useMemo(
      () =>
        button({
          variant: withGradientBackground ? 'gradient' : variant,
          disabled,
          size,
        }),
      [variant, disabled, size, withGradientBackground]
    );

    const ButtonContent = () => (
      <>
        {!!icon && iconPosition == 'left' && <View>{icon}</View>}
        {loading ? (
          <ActivityIndicator
            size="small"
            // className={styles.indicator()}
            color={loadingAnimationColor}
            testID={testID ? `${testID}-activity-indicator` : undefined}
          />
        ) : (
          <>
            {withGradientText ? (
              <GradientText
                colors={[colors.lightSkyBlue, colors.primaryPurple]}
              >
                <Text
                  testID={testID ? `${testID}-label` : undefined}
                  className={styles.label({ className: textClassName })}
                >
                  {text}
                </Text>
              </GradientText>
            ) : (
              <Text
                testID={testID ? `${testID}-label` : undefined}
                className={styles.label({ className: textClassName })}
              >
                {text}
              </Text>
            )}

            {!!icon && iconPosition === 'right' && (
              <View className="ml-2">{icon}</View>
            )}
          </>
        )}
      </>
    );

    if (withGradientBackground) {
      return (
        <LinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          locations={gradientLocations}
          style={{
            borderRadius: 10, // Adjust based on your design needs
            opacity: disabled ? 0.8 : 1,
          }}
        >
          <Pressable
            disabled={disabled || loading}
            className={styles.container({ className })}
            style={{ backgroundColor: 'transparent' }}
            {...props}
            ref={ref}
            testID={testID}
          >
            {props.children ? props.children : <ButtonContent />}
          </Pressable>
        </LinearGradient>
      );
    }

    return (
      <Pressable
        disabled={disabled || loading}
        className={styles.container({ className })}
        {...props}
        ref={ref}
        testID={testID}
      >
        {props.children ? props.children : <ButtonContent />}
      </Pressable>
    );
  }
);

interface IRoundedButton {
  icon: ReactElement;
  label: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
  withGradientBackground?: boolean;
  gradientColors?: string[];
}

export const RoundedButton = ({
  icon,
  label,
  onPress,
  className,
  textClassName,
  withGradientBackground = false,
  gradientColors = ['#60A5FA', '#8B5CF6'],
}: IRoundedButton) => {
  const ButtonContent = () => (
    <>
      {icon}
      <Text className={`text-center font-semibold-poppins ${textClassName}`}>
        {label}
      </Text>
    </>
  );

  if (withGradientBackground) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 14,
          // height: 100,
          // width: 120,
        }}
      >
        <TouchableOpacity
          className={`items-center justify-center gap-3 ${className}`}
          style={{ backgroundColor: 'transparent' }}
          onPress={onPress}
        >
          <ButtonContent />
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <TouchableOpacity
      className={`h-[100px] w-[120px] items-center justify-center gap-3 rounded-2xl bg-primary-100 dark:bg-black ${className}`}
      onPress={onPress}
    >
      <ButtonContent />
    </TouchableOpacity>
  );
};
