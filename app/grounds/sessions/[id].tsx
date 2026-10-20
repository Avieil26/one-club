import { useLocalSearchParams } from 'expo-router';
import { PartnerSessionDetail } from '@/components/PartnerSessions';
export default function Detail() {
 const { id } = useLocalSearchParams<{ id: string }>();
 return <PartnerSessionDetail key={String(id)} id={String(id)} />;
}
