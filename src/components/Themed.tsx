import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewProps
} from 'react-native';
import { avatarSize, radius, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export function Screen({ style, ...props }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.colors.background },
        style
      ]}
      {...props}
    />
  );
}

export function Surface({ style, elevated, ...props }: ViewProps & { elevated?: boolean }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow
        },
        elevated && styles.elevated,
        style
      ]}
      {...props}
    />
  );
}

export function BodyText({ style, ...props }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.body, { color: theme.colors.text }, style]} {...props} />;
}

export function MutedText({ style, ...props }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.muted, { color: theme.colors.textMuted }, style]} {...props} />;
}

export function Title({ style, ...props }: TextProps) {
  const { theme } = useTheme();
  return <Text style={[styles.title, { color: theme.colors.text }, style]} {...props} />;
}

export function SectionHeader({ title, subtitle, style }: { title: string; subtitle?: string; style?: ViewProps['style'] }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function Field({ leftElement, rightElement, style, ...props }: TextInputProps & { leftElement?: React.ReactNode; rightElement?: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.fieldContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {leftElement}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.field,
          { color: theme.colors.text },
          style
        ]}
        {...props}
      />
      {rightElement}
    </View>
  );
}

export function Button({
  label,
  variant = 'primary',
  loading,
  size = 'md',
  style,
  textStyle,
  icon,
  ...props
}: PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accentSoft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  textStyle?: TextProps['style'];
  icon?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isSoft = variant === 'accentSoft';
  const isGhost = variant === 'ghost';

  let backgroundColor = theme.colors.surfaceMuted;
  let color = theme.colors.text;
  let borderColor = theme.colors.border;

  if (isPrimary) {
    backgroundColor = theme.colors.accent;
    color = theme.colors.accentText;
    borderColor = theme.colors.accent;
  } else if (isDanger) {
    backgroundColor = theme.colors.dangerSoft;
    color = theme.colors.danger;
    borderColor = 'transparent';
  } else if (isSoft) {
    backgroundColor = theme.colors.accentSoft;
    color = theme.colors.accent;
    borderColor = 'transparent';
  } else if (isGhost) {
    backgroundColor = 'transparent';
    color = theme.colors.text;
    borderColor = 'transparent';
  }

  const height = size === 'sm' ? 36 : size === 'lg' ? 54 : 46;
  const paddingHorizontal = size === 'sm' ? spacing.sm : spacing.lg;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          height,
          paddingHorizontal,
          backgroundColor,
          borderColor,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }]
        },
        style as object
      ]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {icon}
          <Text style={[styles.buttonText, { color, fontSize: size === 'sm' ? 13 : 15 }, textStyle]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Pill({ label, active, icon, onPress }: { label: string; active?: boolean; icon?: string; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? theme.colors.accent : theme.colors.surfaceMuted,
          borderColor: active ? theme.colors.accent : theme.colors.borderLight,
          opacity: pressed ? 0.85 : 1
        }
      ]}
    >
      {icon ? <Text style={styles.pillIcon}>{icon}</Text> : null}
      <Text style={[styles.pillText, { color: active ? theme.colors.accentText : theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Avatar({
  username,
  avatarUrl,
  size = 'md',
  style
}: {
  username?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ImageStyle>;
}) {
  const { theme } = useTheme();
  const dim = avatarSize[size];
  const initial = (username?.[0] || 'V').toUpperCase();

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[{ width: dim, height: dim, borderRadius: dim / 2 }, style]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: theme.colors.accentSoft,
          borderColor: theme.colors.accent
        },
        style
      ]}
    >
      <Text style={[styles.avatarText, { color: theme.colors.accent, fontSize: dim * 0.45 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  surface: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3
  },
  body: {
    fontSize: 15,
    lineHeight: 22
  },
  muted: {
    fontSize: 13,
    lineHeight: 18
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  sectionHeader: {
    marginBottom: spacing.sm
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md
  },
  field: {
    flex: 1,
    fontSize: 15,
    paddingVertical: spacing.sm
  },
  button: {
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  buttonText: {
    fontWeight: '700'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    justifyContent: 'center'
  },
  pillIcon: {
    fontSize: 14
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600'
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5
  },
  avatarText: {
    fontWeight: '700'
  }
});
