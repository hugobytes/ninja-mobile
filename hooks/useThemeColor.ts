import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { color?: string },
  colorName: keyof typeof Colors
) {
  if (props.color) {
    return props.color;
  } else {
    return Colors[colorName];
  }
}
