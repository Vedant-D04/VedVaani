import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, Theme as NavigationTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from './components/Themed';
import { radius, spacing } from './constants/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { MainTabParamList, RootStackParamList } from './navigation/types';
import { AuthScreen } from './screens/AuthScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { FeedScreen } from './screens/FeedScreen';
import { PostDetailScreen } from './screens/PostDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RecordScreen } from './screens/RecordScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ icon, focused, color }: { icon: string; focused: boolean; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.tabIconContainer, focused && { backgroundColor: theme.colors.accentSoft }]}>
      <Text style={[styles.tabIconText, { opacity: focused ? 1 : 0.6 }]}>{icon}</Text>
    </View>
  );
}

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
          borderTopColor: theme.colors.borderLight,
          height: 64,
          paddingBottom: spacing.xs,
          paddingTop: spacing.xs,
          borderTopWidth: StyleSheet.hairlineWidth
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        }
      }}
    >
      <Tabs.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="📖" focused={focused} color={color} />
        }}
      />
      <Tabs.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🔍" focused={focused} color={color} />
        }}
      />
      <Tabs.Screen
        name="Record"
        component={RecordScreen}
        options={{
          tabBarLabel: 'Record',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🎙️" focused={focused} color={color} />
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="👤" focused={focused} color={color} />
        }}
      />
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
        <ActivityIndicator color={theme.colors.accent} size="large" />
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
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Reading Details' }} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'User Profile' }} />
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
  },
  tabIconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabIconText: {
    fontSize: 18
  }
});
