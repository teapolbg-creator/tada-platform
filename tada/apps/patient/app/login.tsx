import { useState } from 'react';
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const [phone, setPhone] = useState('');
  const canSubmit = phone.replace(/\D/g, '').length >= 9;

  function sendCode() {
    // OTP wiring lands in Module 4 (Hubtel SMS). For now this is a no-op.
    console.log('Send code to', phone);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
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
              Enter your phone number
            </Text>
            <Text className="text-gray-500 text-sm mb-5">
              We'll send you a verification code
            </Text>

            <View className="flex-row items-center bg-gray-50 rounded-button border border-gray-200 px-4 py-3 mb-5">
              <Text className="text-xl mr-3">📱</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="0XX XXX XXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="flex-1 text-base text-gray-900"
                style={{ outlineStyle: 'none' } as object}
              />
            </View>

            <Pressable
              onPress={sendCode}
              disabled={!canSubmit}
              className={`rounded-button py-4 items-center ${canSubmit ? 'bg-tada-500 active:bg-tada-600' : 'bg-tada-200'}`}
            >
              <Text className="text-white text-base font-semibold">Send Code</Text>
            </Pressable>

            <Text className="text-gray-400 text-xs text-center mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
