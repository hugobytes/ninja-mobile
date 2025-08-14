import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  color?: string;
};

export function ThemedView({ style, color: customColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ color: customColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
