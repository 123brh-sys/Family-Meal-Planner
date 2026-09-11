import { GoogleAuthProvider, signInWithCredential } from '@firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

import { auth } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setSigningIn(true);
      const credential = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, credential)
        .catch((err) => setError(err instanceof Error ? err.message : 'Sign-in failed'))
        .finally(() => setSigningIn(false));
    } else if (response?.type === 'error') {
      setError(response.error?.message ?? 'Sign-in failed');
    }
  }, [response]);

  return {
    ready: Boolean(request),
    signingIn,
    error,
    signIn: () => {
      setError(null);
      return promptAsync();
    },
  };
}
