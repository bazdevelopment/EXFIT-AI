export interface ISelectableChip {
  /**
   * The text content to be displayed inside the chip.
   */
  title: string;
  /**
   * A boolean flag to indicate if the chip is currently selected.
   */
  isSelected: boolean;
  /**
   * The function to be executed when the chip is pressed.
   */
  onPress: () => void;
  /**
   * An optional React element to be displayed as an icon next to the title.
   */
  icon?: React.ReactElement;
  /**
   * Optional custom NativeWind classes for the container.
   */
  className?: string;
  /**
   * Optional custom NativeWind classes for the text.
   */
  textClassName?: string;
}
