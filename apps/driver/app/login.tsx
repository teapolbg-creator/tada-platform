import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

/**
 * Operator login (Employee ID + PIN).
 *
 * Pilot: accepts any non-empty Employee ID + a 4-digit PIN. Real auth lands
 * with the rest of the OTP/Supabase work — see BEFORE_LAUNCH.md. Drivers
 * authenticate with a station-issued Employee ID and PIN rather than a
 * personal phone OTP, since the device may be a shared in-vehicle tablet.
 */
export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [touched, setTouched] = useState(false);

  const pinValid = /^\d{4}$/.test(pin);
  const canSubmit = employeeId.trim().length > 0 && pinValid;

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit) return;
    // TODO: replace with supabase.auth.signInWithPassword({ employeeId, pin }).
    router.replace('/dashboard');
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-6 justify-center">
          {/* Brand */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-2xl bg-driver-500 items-center justify-center mb-4">
              <Text className="text-white text-3xl font-black">+</Text>
            </View>
            <Text className="text-white text-3xl font-bold">TADA Driver</Text>
            <Text className="text-slate-400 text-sm mt-1">
              Emergency Response · Crew Sign In
            </Text>
          </View>

          {/* Employee ID */}
          <Text className="text-slate-300 text-sm mb-2">Employee ID</Text>
          <TextInput
            value={employeeId}
            onChangeText={setEmployeeId}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="TADA-PM-0142"
            placeholderTextColor="#64748b"
            className="bg-slate-800 text-white rounded-button px-4 py-3.5 mb-4"
          />

          {/* PIN */}
          <Text className="text-slate-300 text-sm mb-2">4-digit PIN</Text>
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="••••"
            placeholderTextColor="#64748b"
            className="bg-slate-800 text-white rounded-button px-4 py-3.5 tracking-[8px]"
          />

          {touched && !canSubmit && (
            <Text className="text-status-danger text-xs mt-2">
              Enter your Employee ID and a 4-digit PIN.
            </Text>
          )}

          <Pressable
            onPress={handleSubmit}
            className={`rounded-button py-4 mt-6 items-center ${
              canSubmit ? 'bg-driver-500' : 'bg-slate-700'
            }`}
          >
            <Text className="text-white font-semibold text-base">Sign In</Text>
          </Pressable>

          <Text className="text-slate-500 text-xs text-center mt-6">
            Pilot mode · any Employee ID + 4-digit PIN works
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
