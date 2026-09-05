export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999
};

export const avatarSize = {
  sm: 32,
  md: 40,
  lg: 64
};

export const lightTheme = {
  name: 'light' as const,
  colors: {
    background: '#F8F3EA',
    surface: '#FFFCF6',
    surfaceMuted: '#EFE7DA',
    surfaceElevated: '#FFFFFF',
    text: '#211E1A',
    textMuted: '#6F675D',
    textSecondary: '#8A8279',
    border: '#DDD1C2',
    borderLight: '#EDE5D8',
    accent: '#A34B35',
    accentSoft: 'rgba(163,75,53,0.08)',
    accentText: '#FFF8F2',
    danger: '#A13E3E',
    dangerSoft: 'rgba(161,62,62,0.08)',
    shadow: 'rgba(33,30,26,0.08)',
    shadowStrong: 'rgba(33,30,26,0.16)',
    heart: '#E74C5E',
    overlay: 'rgba(33,30,26,0.5)'
  }
};

export const darkTheme = {
  name: 'dark' as const,
  colors: {
    background: '#151412',
    surface: '#201E1B',
    surfaceMuted: '#2B2925',
    surfaceElevated: '#2F2C28',
    text: '#F3EDE5',
    textMuted: '#B8AEA1',
    textSecondary: '#8A8279',
    border: '#3A352F',
    borderLight: '#302C27',
    accent: '#D58667',
    accentSoft: 'rgba(213,134,103,0.12)',
    accentText: '#1C120E',
    danger: '#E18484',
    dangerSoft: 'rgba(225,132,132,0.1)',
    shadow: 'rgba(0,0,0,0.2)',
    shadowStrong: 'rgba(0,0,0,0.4)',
    heart: '#FF6B7A',
    overlay: 'rgba(0,0,0,0.6)'
  }
};

export type AppTheme = typeof lightTheme | typeof darkTheme;
