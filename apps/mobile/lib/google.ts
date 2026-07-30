import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Only configure when both public client IDs are present — calling configure()
// without iosClientId crashes the app at import time on iOS.
if (webClientId && iosClientId) {
  GoogleSignin.configure({ webClientId, iosClientId });
}

function assertGoogleConfigured() {
  if (!webClientId || !iosClientId) {
    throw new Error(
      "Google Sign-In is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in apps/mobile/.env."
    );
  }
}

// Runs the native Google sheet and returns an ID token for supabase.auth.signInWithIdToken.
export async function getGoogleIdToken(): Promise<string> {
  assertGoogleConfigured();
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error("Google sign-in was cancelled or returned no ID token");
  }
  return response.data.idToken;
}
