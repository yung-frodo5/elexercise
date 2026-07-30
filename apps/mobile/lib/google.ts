import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";

// webClientId is what lets Supabase accept the returned ID token; iosClientId
// scopes the native iOS sheet. Both are public OAuth client IDs (not secrets),
// created in Google Cloud Console. Configured once at import.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

// Runs the native Google sheet and returns an ID token for supabase.auth.signInWithIdToken.
export async function getGoogleIdToken(): Promise<string> {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error("Google sign-in was cancelled or returned no ID token");
  }
  return response.data.idToken;
}
