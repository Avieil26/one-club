import { useLanguage } from '@/lib/language';
import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  const { t } = useLanguage();
  return (
    <>
      <Stack.Screen options={{ title: t("לא נמצא", "Not found") }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#10211A' }}>
        <Text style={{ color: '#F7F8FA', fontSize: 20, fontWeight: '700' }}>{t("המסך הזה לא קיים.", "This screen does not exist.")}</Text>
        <Link href="/" style={{ marginTop: 16 }}>
          <Text style={{ color: '#B9D4FF', fontSize: 16 }}>{t("חזרה הביתה", "Back to home")}</Text>
        </Link>
      </View>
    </>
  );
}
