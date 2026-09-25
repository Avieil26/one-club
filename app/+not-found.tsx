import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'לא נמצא' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#10211A' }}>
        <Text style={{ color: '#F7F8FA', fontSize: 20, fontWeight: '700' }}>המסך הזה לא קיים.</Text>
        <Link href="/" style={{ marginTop: 16 }}>
          <Text style={{ color: '#B9D4FF', fontSize: 16 }}>חזרה הביתה</Text>
        </Link>
      </View>
    </>
  );
}
