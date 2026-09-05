import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps
} from 'react-native';
import { radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export function Screen({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  return <View style={[styles.screen, { backgroundColor: theme.colors.background }, style]} {...props} />;
}

export function Surface({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  return <View style={[styles.surface, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, style]} {...props} />;
}

export function BodyText({ style, ...props }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.body, { color: theme.colors.text }, style]} {...props} />;
}

export function MutedText({ style, ...props }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.body, { color: theme.colors.textMuted }, style]} {...props} />;
}

export function Title({ style, ...props }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.title, { color: theme.colors.text }, style]} {...props} />;
}

export function Field(props: TextInputProps) {
  const { theme } = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      style={[
        styles.field,
        {
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border
        },
        props.style
      ]}
      {...props}
    />
  );
}

export function Button({
  label,
  variant = 'primary',
  loading,
  style,
  textStyle,
  ...props
}: PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  textStyle?: TextProps['style'];
}) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const backgroundColor = isPrimary ? theme.colors.accent : isDanger ? 'transparent' : variant === 'ghost' ? 'transparent' : theme.colors.surfaceMuted;
  const color = isPrimary ? theme.colors.accentText : isDanger ? theme.colors.danger : theme.colors.text;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: variant === 'ghost' || isDanger ? theme.colors.border : backgroundColor, opacity: pressed ? 0.72 : 1 },
        style as object
      ]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={[styles.buttonText, { color }, textStyle]}>{label}</Text>}
    </Pressable>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? theme.colors.accent : theme.colors.surfaceMuted,
          borderColor: active ? theme.colors.accent : theme.colors.border
        }
      ]}
    >
      <Text style={[styles.pillText, { color: active ? theme.colors.accentText : theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700'
  },
  field: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16
  },
  button: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700'
  },
  pill: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700'
  }
});
