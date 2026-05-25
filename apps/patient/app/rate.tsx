import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// ---------------------------------------------------------------------------
// Rating screen
//
// Reached via "Submit Rating" on Trip Completed. Captures a 1-5 star rating
// and an optional comment, then navigates back to Home.
//
// REPLACE BEFORE PRODUCTION:
//   Module 5/12 — On submit, write to a trip_ratings table (not yet in the
//   schema — would need a migration adding {trip_id, stars, comment, created_at}).
//   The driver app eventually reads aggregate ratings for the driver's
//   profile display.
// ---------------------------------------------------------------------------

const DRIVER = {
  name: 'Kwame Asante',
  role: 'Paramedic',
  ambulanceCode: 'AMB-GH-2847',
};

// Labels shown beneath the stars, indexed by the current rating value
// (rating - 1 → label). When no rating is selected, no label shows.
const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function Rate() {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleSubmit() {
    if (rating === 0) return;

    // TODO Module 5/12: replace with:
    //   await supabase.from('trip_ratings').insert({
    //     trip_id: currentTripId,
    //     stars: rating,
    //     comment: comment || null,
    //   });
    console.log('Rating submitted (placeholder):', { rating, comment });

    setToast('Thanks for the feedback!');

    // Slight delay so the toast registers before navigation.
    setTimeout(() => router.replace('/home'), 1000);
  }

  function handleSkip() {
    router.replace('/home');
  }

  const canSubmit = rating > 0;
  const ratingLabel = rating > 0 ? RATING_LABELS[rating - 1] : null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-4">
          <Text className="text-2xl">←</Text>
        </Pressable>
        <Text className="text-gray-900 text-xl font-bold">Rate Your Trip</Text>
      </View>

      <ScrollView
        contentContainerClassName="px-6 py-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Driver card */}
        <View className="bg-gray-50 rounded-card p-4 flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center mr-4">
            <Text className="text-xl">👤</Text>
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-base font-bold">
              {DRIVER.name}
            </Text>
            <Text className="text-gray-500 text-sm mt-0.5">
              {DRIVER.role} · {DRIVER.ambulanceCode}
            </Text>
          </View>
        </View>

        {/* Stars */}
        <View className="items-center mt-8">
          <Text className="text-gray-700 text-base font-semibold mb-5">
            How was your trip?
          </Text>
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                hitSlop={8}
                style={{ marginHorizontal: 6 }}
              >
                <Text
                  style={{
                    fontSize: 44,
                    color: star <= rating ? '#FBBF24' : '#E5E7EB',
                  }}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          {/* Rating label — reserves space even when empty so layout doesn't jump */}
          <View style={{ minHeight: 28, marginTop: 12 }}>
            {ratingLabel ? (
              <Text className="text-gray-900 text-lg font-bold">
                {ratingLabel}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Optional comment */}
        <Text className="text-gray-700 text-base font-semibold mt-6 mb-3">
          Additional feedback (optional)
        </Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Tell us about your experience..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-white border border-gray-200 rounded-card p-4 text-base text-gray-900"
          style={{
            minHeight: 110,
            // @ts-expect-error — web-only: hide focus outline
            outlineStyle: 'none',
          }}
        />

        {/* Submit button */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`rounded-card py-4 mt-6 items-center shadow-lg ${
            canSubmit ? 'bg-tada-500 active:bg-tada-600' : 'bg-tada-200'
          }`}
        >
          <Text className="text-white text-base font-bold">Submit Rating</Text>
        </Pressable>

        {/* Skip link */}
        <Pressable onPress={handleSkip} className="py-4 mt-1 items-center">
          <Text className="text-gray-500 text-sm font-semibold">
            Skip and go home
          </Text>
        </Pressable>
      </ScrollView>

      {/* Toast */}
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
