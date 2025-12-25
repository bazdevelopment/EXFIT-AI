import { type BottomSheetModal } from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import { FlashList } from '@shopify/flash-list';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import type { FieldValues } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { ActivityIndicator, View } from 'react-native';
import { Pressable, type PressableProps } from 'react-native';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import { tv } from 'tailwind-variants';

import { translate } from '@/core';

import SelectableButton from '../selectable-button';
import { CaretDown } from './assets/icons';
import { Checkbox, Radio } from './checkbox';
import colors from './colors';
import type { InputControllerType } from './input';
import { useModal } from './modal';
import { Modal } from './modal';
import { Text } from './text';

const selectTv = tv({
  slots: {
    container: 'mb-4',
    label: 'text-grey-100 mb-1 text-lg dark:text-neutral-100',
    input:
      'border-grey-50 mt-0 flex-row items-center justify-center rounded-xl border-[0.5px] p-3  dark:border-neutral-500 dark:bg-neutral-800',
    inputValue: 'dark:text-neutral-100',
  },

  variants: {
    focused: {
      true: {
        input: 'border-neutral-600',
      },
    },
    error: {
      true: {
        input: 'border-danger-600',
        label: 'text-danger-600 dark:text-danger-600',
        inputValue: 'text-danger-600',
      },
    },
    disabled: {
      true: {
        input: 'bg-neutral-200',
      },
    },
  },
  defaultVariants: {
    error: false,
    disabled: false,
  },
});

const List = FlashList;

export type OptionType = { label: string; value: string | number };

type OptionsProps = {
  options: OptionType[];
  onSelect: (option: OptionType) => void;
  value?: string | number;
  testID?: string;
};

function keyExtractor(item: OptionType) {
  return `select-item-${item.value}`;
}

export const Options = React.forwardRef<BottomSheetModal, OptionsProps>(
  ({ options, onSelect, value, isPending, testID, heading }, ref) => {
    const height = '90%';
    const snapPoints = React.useMemo(() => [height, '90%'], [height]);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const renderSelectItem = React.useCallback(
      ({ item }: { item: OptionType }) => (
        <SelectableButton
          key={`select-item-${item.value}`}
          text={item.label}
          isSelected={value === item.value}
          onPress={() => onSelect(item)}
          testID={testID ? `${testID}-item-${item.value}` : undefined}
          icon={item.icon}
          className="bg-white/5 dark:bg-white/5"
        />
      ),
      [onSelect, value, testID]
    );

    return (
      <Modal
        ref={ref}
        index={0}
        // title={heading}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: colors.transparent,
        }}
      >
        <BlurView
          blurAmount={10}
          blurType="dark"
          style={[StyleSheet.absoluteFill]}
        />
        {isPending && <ActivityIndicator size="small" />}
        <Text className="my-4 text-center font-semibold-poppins">
          {translate('settings.language')}
        </Text>
        <List
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          data={options}
          keyExtractor={keyExtractor}
          renderItem={renderSelectItem}
          testID={testID ? `${testID}-modal` : undefined}
          estimatedItemSize={52}
          renderScrollComponent={ScrollView}
        />
      </Modal>
    );
  }
);

const Option = React.memo(
  ({
    label,
    selected = false,
    ...props
  }: PressableProps & {
    selected?: boolean;
    label: string;
  }) => {
    return (
      <Pressable
        className="flex-row items-center border-b border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
        {...props}
      >
        <Text className="flex-1 dark:text-neutral-100 ">{label}</Text>
        {selected && <Check />}
      </Pressable>
    );
  }
);

export interface SelectProps {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  error?: string;
  options?: OptionType[];
  onSelect?: (value: string | number) => void;
  placeholder?: string;
  testID?: string;
}
interface ControlledSelectProps<T extends FieldValues>
  extends SelectProps,
    InputControllerType<T> {}

export const Select = (props: SelectProps) => {
  const {
    label,
    value,
    error,
    options = [],
    placeholder = 'select...',
    disabled = false,
    onSelect,
    testID,
  } = props;
  const modal = useModal();

  const onSelectOption = React.useCallback(
    (option: OptionType) => {
      onSelect?.(option.value);
      modal.dismiss();
    },
    [modal, onSelect]
  );

  const styles = React.useMemo(
    () =>
      selectTv({
        error: Boolean(error),
        disabled,
      }),
    [error, disabled]
  );

  const textValue = React.useMemo(
    () =>
      value !== undefined
        ? (options?.filter((t) => t.value === value)?.[0]?.label ?? placeholder)
        : placeholder,
    [value, options, placeholder]
  );

  return (
    <>
      <View className={styles.container()}>
        {label && (
          <Text
            testID={testID ? `${testID}-label` : undefined}
            className={styles.label()}
          >
            {label}
          </Text>
        )}
        <Pressable
          className={styles.input()}
          disabled={disabled}
          onPress={modal.present}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          <View className="flex-1">
            <Text className={styles.inputValue()}>{textValue}</Text>
          </View>
          <CaretDown />
        </Pressable>
        {error && (
          <Text
            testID={`${testID}-error`}
            className="text-sm text-danger-300 dark:text-danger-600"
          >
            {error}
          </Text>
        )}
      </View>
      <Options
        testID={testID}
        ref={modal.ref}
        options={options}
        onSelect={onSelectOption}
      />
    </>
  );
};

// only used with react-hook-form
export function ControlledSelect<T extends FieldValues>(
  props: ControlledSelectProps<T>
) {
  const { name, control, rules, onSelect: onNSelect, ...selectProps } = props;

  const { field, fieldState } = useController({ control, name, rules });
  const onSelect = React.useCallback(
    (value: string | number) => {
      field.onChange(value);
      onNSelect?.(value);
    },
    [field, onNSelect]
  );
  return (
    <Select
      onSelect={onSelect}
      value={field.value}
      error={fieldState.error?.message}
      {...selectProps}
    />
  );
}

const Check = ({ ...props }: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    viewBox="0 0 25 24"
    {...props}
    className="stroke-black dark:stroke-white"
  >
    <Path
      d="m20.256 6.75-10.5 10.5L4.506 12"
      strokeWidth={2.438}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const indicatorsType = {
  checkbox: Checkbox,
  radio: Radio,
};

export const SelectableLabel = ({
  title,
  selected = false,
  icon,
  showIndicator = true,
  subtitle,
  onPress,
  additionalClassName,
  titleClassName,
  subtitleClassName,
  indicatorPosition = 'right',
  indicatorType = 'radio',
  extraInfo,
  ...props
}: ISelectableLabel) => {
  const Indicator = indicatorsType[indicatorType];
  return (
    <Pressable
      className={`
        mt-4 flex-row items-center gap-4 rounded-2xl
        p-6
        ${selected ? 'border-[3px] border-primary-500' : 'bg-primary-100 dark:bg-blackEerie'}
        active:bg-gray-100 dark:active:bg-primary-700
        ${additionalClassName}
      `}
      onPress={onPress}
      {...props}
    >
      {showIndicator && indicatorPosition === 'left' && (
        <Indicator
          disabled={false}
          onPress={onPress}
          checked={selected}
          testID="radio"
          accessibilityLabel="Agree"
          accessibilityHint="toggle Agree"
        />
      )}
      <View className="flex-1 flex-row items-center">
        {icon && <View className="items-center justify-center">{icon}</View>}
        <View className="gap-2">
          <Text
            className={`
            text-base
            ${selected ? 'font-medium-poppins text-lg text-white' : 'font-medium-poppins text-lg'}
         ${titleClassName}
          `}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              className={`
            ${selected ? 'text-md font-bold-poppins text-white' : ' text-md'}
            ${subtitleClassName}
          `}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {!!extraInfo && (
        <View
          className={`absolute right-2 top-[10px] flex-row items-center gap-2 rounded-xl bg-primary-500 px-5 py-1 ${selected ? 'dark:bg-blackEerie' : 'dark:border dark:border-primary-800 dark:bg-blackEerie'}`}
        >
          <Text className="font-bold-poppins">{extraInfo}</Text>
        </View>
      )}

      {showIndicator && indicatorPosition === 'right' && (
        <Indicator
          disabled={false}
          onChange={onPress}
          checked={selected}
          testID="radio"
          accessibilityLabel="Agree"
          accessibilityHint="toggle Agree"
        />
      )}
    </Pressable>
  );
};
