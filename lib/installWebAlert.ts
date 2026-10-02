import { Alert, Platform } from 'react-native';

import { presentNotice } from '@/lib/notice';

if (Platform.OS === 'web') {
  Alert.alert = ((title, message, buttons) => {
    presentNotice(title == null ? '' : String(title), message == null ? '' : String(message), buttons);
  }) as typeof Alert.alert;
}
