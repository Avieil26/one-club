import { Text, View } from 'react-native';

export default function ChampionsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#070609', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>FUT Champions</Text>
      <Text style={{ color: '#AAB4BE', marginTop: 10 }}>מסך בדיקת runtime — אם זה נטען, הבעיה נמצאת בקומפוננטת Champions המלאה.</Text>
    </View>
  );
}
