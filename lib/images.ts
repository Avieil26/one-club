import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function pickImages(limit: number): Promise<string[]> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('צריך אישור לגלריה כדי לבחור צילום מסך.');
    }
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.4,
    base64: true,
  });
  if (result.canceled) return [];
  return result.assets.slice(0, limit).map((asset) => {
    if (asset.base64) return `data:image/jpeg;base64,${asset.base64}`;
    return asset.uri;
  });
}
