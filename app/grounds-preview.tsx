import { ImageBackground, StyleSheet, View } from 'react-native';

import { GROUNDS_PREVIEW_BACKGROUND } from '@/assets/groundsPreviewBackground';

export default function GroundsPreviewBackground() {
  return (
    <View style={styles.screen} accessibilityLabel="THE GROUNDS background preview">
      <ImageBackground
        source={{ uri: GROUNDS_PREVIEW_BACKGROUND }}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#070b16',
    overflow: 'hidden',
  },
});
