export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999
};

export const lightTheme = {
  name: 'light' as const,
  colors: {
    background: '#F8F3EA',
    surface: '#FFFCF6',
    surfaceMuted: '#EFE7DA',
    text: '#211E1A',
    textMuted: '#6F675D',
    border: '#DDD1C2',
    accent: '#A34B35',
    accentText: '#FFF8F2',
    danger: '#A13E3E',
    shadow: '#211E1A'
  }
};

export const darkTheme = {
  name: 'dark' as const,
  colors: {
    background: '#151412',
    surface: '#201E1B',
    surfaceMuted: '#2B2925',
    text: '#F3EDE5',
    textMuted: '#B8AEA1',
    border: '#3A352F',
    accent: '#D58667',
    accentText: '#1C120E',
    danger: '#E18484',
    shadow: '#000000'
  }
};

export type AppTheme = typeof lightTheme | typeof darkTheme;
