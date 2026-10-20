import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** A real native modal: Android Back closes it and the keyboard cannot cover its panel. */
export function AppModal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
