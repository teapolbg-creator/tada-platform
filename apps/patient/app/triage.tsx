import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

// ---------------------------------------------------------------------------
// Triage form — optional emergency details the patient can provide while
// waiting for the ambulance.
//
// State passing (until Module 5 backend lands):
//   Triage → En Route uses URL params:
//     /tracking?triage=saved&whoNeedsHelp=...&emergencyType=...&...
//     /tracking?triage=skipped
//
//   When the user taps "Edit" on the saved card, En Route → Triage passes
//   the previously-saved values back so the form pre-fills.
//
// PLACEHOLDER PERSISTENCE: still no DB writes yet — Save just packages the
// form into URL params and navigates back. The TODO block in handleSave()
// shows the exact triage_records upsert that replaces the URL-param flow
// once Module 5 wires the trip lifecycle.
// ---------------------------------------------------------------------------

// ---- Data shape ----------------------------------------------------------

type WhoNeedsHelp = 'self' | 'other';
type EmergencyType = 'medical' | 'cardiac' | 'breathing' | 'trauma' | 'other';
type ConsciousState = 'yes' | 'no_or_unsure';

interface TriageFormState {
  whoNeedsHelp: WhoNeedsHelp | null;
  emergencyType: EmergencyType | null;
  numberOfPatients: number;
  consciousState: ConsciousState | null;
  description: string;
}

// ---- Options for the choice fields ----------------------------------------

const WHO_OPTIONS: Array<{ value: WhoNeedsHelp; label: string; icon: string }> = [
  { value: 'self', label: 'Myself', icon: '👤' },
  { value: 'other', label: 'Someone Else', icon: '👥' },
];

const EMERGENCY_OPTIONS: Array<{ value: EmergencyType; label: string; icon: string }> = [
  { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
  { value: 'cardiac', label: 'Cardiac/Heart', icon: '❤️' },
  { value: 'breathing', label: 'Breathing Problem', icon: '🫁' },
  { value: 'trauma', label: 'Accident/Trauma', icon: '🚗' },
  { value: 'other', label: 'Other Emergency', icon: '🚨' },
];

// ---- Helpers -------------------------------------------------------------

function isWhoNeedsHelp(v: string | undefined): v is WhoNeedsHelp {
  return v === 'self' || v === 'other';
}

function isEmergencyType(v: string | undefined): v is EmergencyType {
  return (
    v === 'medical' ||
    v === 'cardiac' ||
    v === 'breathing' ||
    v === 'trauma' ||
    v === 'other'
  );
}

function isConsciousState(v: string | undefined): v is ConsciousState {
  return v === 'yes' || v === 'no_or_unsure';
}

// ---- Component ------------------------------------------------------------

export default function Triage() {
  // Pre-fill from URL params if the user tapped Edit on a previously-saved
  // entry. Falls back to empty state if no params are present.
  const params = useLocalSearchParams<{
    whoNeedsHelp?: string;
    emergencyType?: string;
    numberOfPatients?: string;
    consciousState?: string;
    description?: string;
  }>();

  const [form, setForm] = useState<TriageFormState>(() => ({
    whoNeedsHelp: isWhoNeedsHelp(params.whoNeedsHelp)
      ? params.whoNeedsHelp
      : null,
    emergencyType: isEmergencyType(params.emergencyType)
      ? params.emergencyType
      : null,
    numberOfPatients: params.numberOfPatients
      ? Math.max(1, Math.min(20, parseInt(params.numberOfPatients, 10) || 1))
      : 1,
    consciousState: isConsciousState(params.consciousState)
      ? params.consciousState
      : null,
    description: params.description ?? '',
  }));

  const [toast, setToast] = useState<string | null>(null);

  const canSave =
    form.whoNeedsHelp !== null &&
    form.emergencyType !== null &&
    form.consciousState !== null &&
    form.numberOfPatients > 0;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  function setField<K extends keyof TriageFormState>(
    key: K,
    value: TriageFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function decrement() {
    setForm((prev) => ({
      ...prev,
      numberOfPatients: Math.max(1, prev.numberOfPatients - 1),
    }));
  }

  function increment() {
    setForm((prev) => ({
      ...prev,
      numberOfPatients: Math.min(20, prev.numberOfPatients + 1),
    }));
  }

  function handleSkip() {
    router.replace({ pathname: '/tracking', params: { triage: 'skipped' } });
  }

  function handleSave() {
    if (!canSave) return;

    // TODO: when Module 5 wires the trip lifecycle, replace this with:
    //   await supabase.from('triage_records').upsert({
    //     trip_id: currentTripId,
    //     who_needs_help: form.whoNeedsHelp,
    //     emergency_type: form.emergencyType === 'medical' ? 'other' : form.emergencyType,
    //     number_of_patients: form.numberOfPatients,
    //     is_conscious: form.consciousState === 'yes',
    //     is_breathing: form.consciousState === 'yes',
    //     chief_complaint: form.description || null,
    //   });
    console.log('Triage form saved (placeholder):', form);

    setToast('Details saved');

    // Pack the form into URL params so En Route can render the "saved"
    // confirmation card. Slight delay so the toast registers before nav.
    setTimeout(() => {
      router.replace({
        pathname: '/tracking',
        params: {
          triage: 'saved',
          whoNeedsHelp: form.whoNeedsHelp ?? '',
          emergencyType: form.emergencyType ?? '',
          numberOfPatients: String(form.numberOfPatients),
          consciousState: form.consciousState ?? '',
          description: form.description,
        },
      });
    }, 700);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-4">
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-gray-900 text-xl font-bold">Emergency Details</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 py-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 text-sm mb-6">
          Help the paramedic prepare for your emergency. All fields are optional;
          the description can be left blank.
        </Text>

        <FieldLabel>Who needs help?</FieldLabel>
        <View className="flex-row mb-6">
          {WHO_OPTIONS.map((opt, i) => (
            <ChoiceCard
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              selected={form.whoNeedsHelp === opt.value}
              onPress={() => setField('whoNeedsHelp', opt.value)}
              style={{ marginRight: i === 0 ? 8 : 0, marginLeft: i === 1 ? 8 : 0 }}
            />
          ))}
        </View>

        <FieldLabel>Type of emergency</FieldLabel>
        <View className="mb-6">
          {EMERGENCY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setField('emergencyType', opt.value)}
              className={`flex-row items-center px-4 py-4 rounded-card border mb-2 ${
                form.emergencyType === opt.value
                  ? 'border-tada-500 bg-tada-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="text-2xl mr-3">{opt.icon}</Text>
              <Text
                className={`text-base font-semibold flex-1 ${
                  form.emergencyType === opt.value
                    ? 'text-tada-500'
                    : 'text-gray-900'
                }`}
              >
                {opt.label}
              </Text>
              {form.emergencyType === opt.value ? (
                <Text className="text-tada-500 text-lg">✓</Text>
              ) : null}
            </Pressable>
          ))}
        </View>

        <FieldLabel>How many people need help?</FieldLabel>
        <View className="flex-row items-center mb-6">
          <Pressable
            onPress={decrement}
            disabled={form.numberOfPatients <= 1}
            className={`w-14 h-14 rounded-card items-center justify-center ${
              form.numberOfPatients <= 1 ? 'bg-gray-100' : 'bg-gray-200 active:bg-gray-300'
            }`}
          >
            <Text
              className={`text-3xl font-bold ${
                form.numberOfPatients <= 1 ? 'text-gray-400' : 'text-gray-900'
              }`}
            >
              −
            </Text>
          </Pressable>
          <View className="flex-1 bg-gray-100 mx-3 rounded-card py-4 items-center">
            <Text className="text-gray-900 text-3xl font-bold">
              {form.numberOfPatients}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {form.numberOfPatients === 1 ? 'person' : 'people'}
            </Text>
          </View>
          <Pressable
            onPress={increment}
            className="w-14 h-14 rounded-card bg-tada-500 active:bg-tada-600 items-center justify-center"
          >
            <Text className="text-white text-3xl font-bold">+</Text>
          </Pressable>
        </View>

        <FieldLabel>Is the patient conscious and breathing?</FieldLabel>
        <View className="flex-row mb-6">
          <ChoiceCard
            icon="✓"
            label="Yes"
            iconStyle={{ color: '#22C55E' }}
            selected={form.consciousState === 'yes'}
            onPress={() => setField('consciousState', 'yes')}
            style={{ marginRight: 8 }}
          />
          <ChoiceCard
            icon="⚠️"
            label="No / Unsure"
            selected={form.consciousState === 'no_or_unsure'}
            onPress={() => setField('consciousState', 'no_or_unsure')}
            style={{ marginLeft: 8 }}
          />
        </View>

        <FieldLabel>Brief description (optional)</FieldLabel>
        <TextInput
          value={form.description}
          onChangeText={(v) => setField('description', v)}
          placeholder="Symptoms, what happened..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-white border border-gray-200 rounded-card p-4 text-base text-gray-900 mb-8"
          style={{
            minHeight: 120,
            // @ts-expect-error — web-only: hide focus outline
            outlineStyle: 'none',
          }}
        />

        <View className="flex-row">
          <Pressable
            onPress={handleSkip}
            className="flex-1 py-4 items-center mr-3"
          >
            <Text className="text-gray-500 text-base font-semibold">Skip</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`flex-1 rounded-card py-4 items-center shadow-lg ${
              canSave ? 'bg-tada-500 active:bg-tada-600' : 'bg-tada-200'
            }`}
          >
            <Text className="text-white text-base font-bold">Save Details</Text>
          </Pressable>
        </View>
      </ScrollView>

      {toast ? (
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <View className="bg-gray-900 px-5 py-3 rounded-button shadow-lg">
            <Text className="text-white text-sm">{toast}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

interface FieldLabelProps {
  children: string;
}

function FieldLabel({ children }: FieldLabelProps) {
  return (
    <Text className="text-gray-700 text-base font-semibold mb-3">{children}</Text>
  );
}

interface ChoiceCardProps {
  icon: string;
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: object;
  iconStyle?: { color?: string };
}

function ChoiceCard({
  icon,
  label,
  selected,
  onPress,
  style,
  iconStyle,
}: ChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={style}
      className={`flex-1 py-5 rounded-card border items-center ${
        selected ? 'border-tada-500 bg-tada-50' : 'border-gray-200 bg-white'
      }`}
    >
      <Text className="text-3xl mb-1" style={iconStyle}>{icon}</Text>
      <Text
        className={`text-base font-semibold ${
          selected ? 'text-tada-500' : 'text-gray-900'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
