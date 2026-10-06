import { Redirect } from 'expo-router';

function hasOAuthReturnParams(): boolean {
  if (typeof window === 'undefined') return false;
  const href = window.location.href;
  return /[?&#](?:code|access_token|refresh_token|error|error_description)=/.test(href);
}

export default function Index() {
  return <Redirect href={hasOAuthReturnParams() ? '/auth/callback' : '/(tabs)'} />;
}
