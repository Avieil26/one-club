import { Stack } from 'expo-router';
import { Platform, Text, View } from 'react-native';

import { AccountForm } from '@/components/AccountForm';
import { colors } from '@/components/ui';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, flexDirection: Platform.OS === 'web' ? 'row-reverse' : 'column' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: Platform.OS === 'web' ? 1 : undefined, backgroundColor: '#0C1914', justifyContent: 'flex-end', padding: 32, minHeight: 180 }}>
        <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '700', textAlign: 'right' }}>FC27 ישראל</Text>
        <Text style={{ color: colors.text, fontSize: 56, fontWeight: '800', textAlign: 'right' }}>הרשמה</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', padding: 28 }}>
        <AccountForm />
      </View>
    </View>
  );
}
