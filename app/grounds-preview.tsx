import { ImageBackground, StyleSheet, View } from 'react-native';

export default function GroundsPreviewBackground() {
  return (
    <View style={styles.screen} accessibilityLabel="THE GROUNDS background preview">
      <ImageBackground
        source={require('@/assets/images/grounds-preview-background.jpg')}
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
