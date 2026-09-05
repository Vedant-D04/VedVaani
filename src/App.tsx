import { DefaultTheme, NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MainTabParamList, RootStackParamList } from './navigation/types';
import { AuthScreen } from './screens/AuthScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { FeedScreen } from './screens/FeedScreen';
import { PostDetailScreen } from './screens/PostDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RecordScreen } from './screens/RecordScreen';
import { Screen } from './components/Themed';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen name="Feed" component={FeedScreen} options={{ tabBarIcon: () => null }} />
      <Tabs.Screen name="Explore" component={ExploreScreen} options={{ tabBarIcon: () => null }} />
      <Tabs.Screen name="Record" component={RecordScreen} options={{ tabBarIcon: () => null }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: () => null }} />
    </Tabs.Navigator>
  );
}

function RootNavigator() {
  const { session, initializing } = useAuth();
  const { theme, resolvedTheme } = useTheme();

  const navTheme: NavigationTheme = {
    ...DefaultTheme,
    dark: resolvedTheme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.accent
    }
  };

  if (initializing) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
      </Screen>
    );
  }

  if (!session) {
    return (
      <>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <AuthScreen />
      </>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Reading' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
