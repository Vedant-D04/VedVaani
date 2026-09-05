import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { radius, spacing } from '../constants/theme';
import { hasSupabaseConfig, supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';

type AuthStep = 'email' | 'sent';

export function AuthScreen() {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<AuthStep>('email');

  // ─── Animations ──────────────────────────────────────────
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(32)).current;
  const accentWidth = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const sentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(accentWidth, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ])
    ]).start();
  }, []);

  const animateToSent = () => {
    Animated.timing(sentFade, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── Handlers ────────────────────────────────────────────
  const sendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    const redirectTo =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : 'vedvaani://auth';

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo }
    });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      if (Platform.OS !== 'web') {
        Alert.alert('Magic link failed', error.message);
      }
    } else {
      setStep('sent');
      animateToSent();
    }
  };

  const goBack = () => {
    sentFade.setValue(0);
    setStep('email');
  };

  // ─── Colors ──────────────────────────────────────────────
  const c = theme.colors;
  const accentGlow = isDark ? 'rgba(213,134,103,0.12)' : 'rgba(163,75,53,0.08)';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputFocusBorder = c.accent;

  // ─── Input focus state ───────────────────────────────────
  const [isFocused, setIsFocused] = useState(false);

  // ─── Decorative dots pattern ─────────────────────────────
  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < 5; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: c.accent,
              opacity: 0.15 + i * 0.08,
              width: 6 + i * 2,
              height: 6 + i * 2,
              borderRadius: (6 + i * 2) / 2,
              marginLeft: i === 0 ? 0 : 8
            }
          ]}
        />
      );
    }
    return <View style={styles.dotsRow}>{dots}</View>;
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>

          {/* ─── Accent strip ─────────────────────────────── */}
          <Animated.View
            style={[
              styles.accentStrip,
              {
                backgroundColor: c.accent,
                width: accentWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]}
          />

          {/* ─── Main card ────────────────────────────────── */}
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                opacity: fadeIn,
                transform: [{ translateY: slideUp }, { scale: cardScale }]
              }
            ]}
          >
            {/* Subtle glow behind card */}
            <View
              style={[
                styles.cardGlow,
                { backgroundColor: accentGlow }
              ]}
            />

            {step === 'email' ? (
              <View style={styles.cardInner}>
                {/* Logo / Brand */}
                <View style={styles.brandRow}>
                  <View style={[styles.logoMark, { backgroundColor: c.accent }]}>
                    <Text style={[styles.logoLetter, { color: c.accentText }]}>V</Text>
                  </View>
                </View>

                <Text style={[styles.appName, { color: c.text }]}>VedVaani</Text>

                {renderDots()}

                <Text style={[styles.tagline, { color: c.textMuted }]}>
                  Read a paragraph from a book you love.{'\n'}Listen to the voices behind other people's shelves.
                </Text>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: c.border }]} />

                <Text style={[styles.instruction, { color: c.textMuted }]}>
                  Enter your email to sign in or create an account
                </Text>

                {errorMessage ? (
                  <View style={[styles.configBanner, { backgroundColor: isDark ? 'rgba(225,132,132,0.15)' : 'rgba(161,62,62,0.1)' }]}>
                    <Text style={[styles.configText, { color: c.danger }]}>
                      ⚠️ {errorMessage}
                    </Text>
                  </View>
                ) : null}

                {!hasSupabaseConfig && (
                  <View style={[styles.configBanner, { backgroundColor: isDark ? 'rgba(225,132,132,0.1)' : 'rgba(161,62,62,0.08)' }]}>
                    <Text style={[styles.configText, { color: c.danger }]}>
                      ⚠ Add SUPABASE_URL and ANON_KEY to .env
                    </Text>
                  </View>
                )}

                {/* Email input */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: inputBg,
                      borderColor: isFocused ? inputFocusBorder : inputBorder,
                      ...(isFocused && {
                        shadowColor: c.accent,
                        shadowOpacity: isDark ? 0.3 : 0.15,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 0 }
                      })
                    }
                  ]}
                >
                  <Text style={[styles.inputIcon, { color: c.textMuted }]}>✉</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="you@example.com"
                    placeholderTextColor={isDark ? 'rgba(184,174,161,0.5)' : 'rgba(111,103,93,0.5)'}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={hasSupabaseConfig}
                    style={[styles.input, { color: c.text }]}
                    returnKeyType="send"
                    onSubmitEditing={sendLink}
                  />
                </View>

                {/* Send button */}
                <Pressable
                  onPress={sendLink}
                  disabled={!hasSupabaseConfig || !email.trim() || loading}
                  style={({ pressed }) => [
                    styles.sendButton,
                    {
                      backgroundColor: c.accent,
                      opacity: (!hasSupabaseConfig || !email.trim()) ? 0.4 : pressed ? 0.8 : 1
                    }
                  ]}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <View style={[styles.spinner, { borderColor: c.accentText, borderTopColor: 'transparent' }]} />
                      <Text style={[styles.sendButtonText, { color: c.accentText }]}>Sending…</Text>
                    </View>
                  ) : (
                    <Text style={[styles.sendButtonText, { color: c.accentText }]}>Send magic link →</Text>
                  )}
                </Pressable>

                {/* Footer */}
                <Text style={[styles.footer, { color: c.textMuted }]}>
                  No password required. We'll email you a sign-in link.
                </Text>
              </View>
            ) : (
              /* ─── Sent confirmation ─────────────────────── */
              <Animated.View style={[styles.cardInner, styles.sentInner, { opacity: sentFade }]}>
                <View style={[styles.sentIconCircle, { backgroundColor: isDark ? 'rgba(213,134,103,0.15)' : 'rgba(163,75,53,0.1)' }]}>
                  <Text style={styles.sentIcon}>📬</Text>
                </View>

                <Text style={[styles.sentTitle, { color: c.text }]}>Check your inbox</Text>

                <Text style={[styles.sentDescription, { color: c.textMuted }]}>
                  We sent a magic link to
                </Text>
                <Text style={[styles.sentEmail, { color: c.accent }]}>{email}</Text>
                <Text style={[styles.sentDescription, { color: c.textMuted, marginTop: spacing.sm }]}>
                  Click the link in the email to sign in.{'\n'}It may take a moment to arrive.
                </Text>

                <View style={[styles.divider, { backgroundColor: c.border, marginTop: spacing.lg }]} />

                <Pressable onPress={goBack} style={({ pressed }) => [styles.backButton, { borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={[styles.backButtonText, { color: c.text }]}>← Use a different email</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setStep('email');
                    sentFade.setValue(0);
                    sendLink();
                  }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginTop: spacing.sm }]}
                >
                  <Text style={[styles.resendText, { color: c.textMuted }]}>Didn't get it? Resend link</Text>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>

          {/* ─── Bottom brand ─────────────────────────────── */}
          <Animated.View style={[styles.bottomBrand, { opacity: fadeIn }]}>
            <Text style={[styles.bottomText, { color: c.textMuted }]}>
              VedVaani · Voices from every shelf
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },

  // Accent strip
  accentStrip: {
    height: 3,
    borderRadius: 2,
    marginBottom: spacing.xl,
    alignSelf: 'stretch'
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    position: 'relative'
  },
  cardGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100
  },
  cardInner: {
    padding: spacing.lg + 4,
    gap: spacing.md
  },

  // Brand
  brandRow: {
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoLetter: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5
  },

  // Typography
  appName: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.8
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  instruction: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs
  },
  dot: {},

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: spacing.xs
  },

  // Config banner
  configBanner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md
  },
  configText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center'
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.md + 2,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md
  },
  inputIcon: {
    fontSize: 18,
    marginRight: spacing.sm
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    minHeight: 52
  },

  // Send button
  sendButton: {
    minHeight: 52,
    borderRadius: radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2
  },

  // Footer
  footer: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },

  // Sent state
  sentInner: {
    alignItems: 'center',
    paddingVertical: spacing.xl
  },
  sentIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  sentIcon: {
    fontSize: 32
  },
  sentTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5
  },
  sentDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  sentEmail: {
    fontSize: 16,
    fontWeight: '700'
  },
  backButton: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600'
  },
  resendText: {
    fontSize: 14,
    textDecorationLine: 'underline'
  },

  // Bottom brand
  bottomBrand: {
    marginTop: spacing.xl,
    alignItems: 'center'
  },
  bottomText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3
  }
});
