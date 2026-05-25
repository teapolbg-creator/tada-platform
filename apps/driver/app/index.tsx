import { Redirect } from 'expo-router';

// The driver flow starts at Login. Real builds will check for a persisted
// Supabase session here and skip straight to /dashboard when one exists.
export default function Index() {
  return <Redirect href="/login" />;
}
