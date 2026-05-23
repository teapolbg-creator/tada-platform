import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

// Interim verification rule. Replaced with a real call to auth-otp-verify
// once Module 4 is wired up. Treats 123456 as the only valid code so the
// flow can be exercised end-to-end without a Supabase round-trip.
const INTERIM_VALID_CODE = '123456';

export default function Otp() {
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone ?? '2222222222';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [toast, setToast] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  // Tick the resend cooldown down each second. Stops at 0.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Toast auto-dismiss after 2 seconds.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Focus the hidden input on mount so the keyboard appears immediately.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-submit when the user has entered exactly CODE_LENGTH digits.
  useEffect(() => {
    if (code.length !== CODE_LENGTH) return;
    verify(code);
    // We deliberately don't include `verify` in deps — it's stable here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function handleChange(next: string) {
    // Digits only, up to CODE_LENGTH.
    const digits = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    // Clear error as soon as the user starts typing again.
    if (error) setError(null);
  }

  function verify(submitted: string) {
    if (submitted === INTERIM_VALID_CODE) {
      router.replace('/home');
    } else {
      setError('Incorrect code. Try again.');
      // Don't clear the digits — let the user see what they typed.
      // They can backspace or paste a new code.
    }
  }

  function handleChangeNumber() {
    router.replace('/login');
  }

  function handleResend() {
    if (cooldown > 0) return;
    // Real "send code" happens when Module 4 lands. For now we just show
    // a toast and restart the cooldown so the UX is wired end-to-end.
    setCooldown(RESEND_COOLDOWN_SECONDS);
    setCode('');
    setError(null);
    setToast('Code resent');
    inputRef.current?.focus();
  }

  function focusInput() {
    inputRef.current?.focus();
  }

  // Compute which box index is currently "active" so we can style it.
  const activeIndex = Math.min(code.length, CODE_LENGTH - 1);

  return (
    <SafeAreaView className="flex-1 bg-tada-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <Text className="text-gray-900 text-4xl font-bold text-center">
            Welcome to TADA
          </Text>
          <Text className="text-gray-500 text-base text-center mt-2 mb-10">
            Emergency help when you need it most
          </Text>

          <View className="bg-white rounded-card p-6 shadow-sm">
            <Text className="text-gray-900 text-xl font-semibold mb-1">
              Enter verification code
            </Text>

            <View className="flex-row flex-wrap items-center mb-5">
              <Text className="text-gray-500 text-sm">
                We sent a code to {phone}
              </Text>
              <Pressable onPress={handleChangeNumber} hitSlop={8} className="ml-2">
                <Text className="text-tada-500 text-sm font-semibold">Change</Text>
              </Pressable>
            </View>

            {/* The visible code boxes. Tapping any box focuses the hidden input. */}
            <Pressable onPress={focusInput}>
              <View className="flex-row justify-between mb-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const digit = code[i] ?? '';
                  const isFilled = digit !== '';
                  const isActive = !error && i === activeIndex && code.length < CODE_LENGTH;
                  const borderClass = error
                    ? 'border-tada-500'
                    : isFilled
                      ? 'border-gray-900'
                      : isActive
                        ? 'border-tada-500'
                        : 'border-gray-200';
                  return (
                    <View
                      key={i}
                      className={`w-12 h-14 rounded-button border-2 items-center justify-center ${borderClass}`}
                    >
                      <Text className="text-2xl font-semibold text-gray-900">
                        {digit}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Pressable>

            {/* The actual input — visually hidden, holds the keyboard focus. */}
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              autoComplete={Platform.OS === 'ios' ? 'one-time-code' : 'sms-otp'}
              textContentType="oneTimeCode"
              importantForAutofill="yes"
              caretHidden
              style={{
                position: 'absolute',
                opacity: 0,
                width: 1,
                height: 1,
                top: 0,
                left: 0,
                // @ts-expect-error — web-only style to hide focus outline
                outlineStyle: 'none',
              }}
            />

            {/* Error message — fixed-height row so the layout doesn't shift. */}
            <View className="h-6 mt-2 mb-2">
              {error ? (
                <Text className="text-tada-500 text-sm text-center" role="alert">
                  {error}
                </Text>
              ) : null}
            </View>

            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-gray-500 text-sm">Didn't receive code?</Text>
              <Pressable
                onPress={handleResend}
                disabled={cooldown > 0}
                hitSlop={8}
                className="ml-2"
              >
                <Text
                  className={`text-sm font-semibold ${
                    cooldown > 0 ? 'text-gray-400' : 'text-tada-500'
                  }`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Lightweight toast — banner that floats above the card briefly. */}
        {toast ? (
          <View className="absolute bottom-10 left-0 right-0 items-center">
            <View className="bg-gray-900 px-5 py-3 rounded-button shadow-lg">
              <Text className="text-white text-sm">{toast}</Text>
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
