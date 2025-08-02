export interface iSelectableButton {
  icon: string; // Emoji or simple character for the icon
  text: string;
  isSelected: boolean;
  onPress: () => void;
  className?: string;
  disabled?: boolean;
}
