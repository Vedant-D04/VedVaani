import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { spacing } from '../constants/theme';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { BodyText, Button, Field, MutedText, Screen, Title } from '../components/Themed';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'vedvaani://auth';
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo
      }
    });
    setLoading(false);

    if (error) {
      Alert.alert('Magic link failed', error.message);
    } else {
      Alert.alert('Check your inbox', 'Your sign-in link is on its way.');
    }
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <Title>VedVaani</Title>
        <BodyText>Read a paragraph from a book you love. Listen to the voices behind other people's shelves.</BodyText>
        <MutedText>New here? Enter your email to register your account. Returning readers use the same field to sign in.</MutedText>
        {!hasSupabaseConfig ? (
          <MutedText>Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env` to enable auth.</MutedText>
        ) : null}
        <Field
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          editable={hasSupabaseConfig}
        />
        <Button label="Send magic link" onPress={sendLink} loading={loading} disabled={!hasSupabaseConfig || !email.trim()} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center'
  },
  inner: {
    gap: spacing.lg
  }
});
