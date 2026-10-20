import { useLocalSearchParams } from 'expo-router';
import { CareerJourneyDetail } from '@/components/CareerJourneys';
export default function Detail() {
 const { id } = useLocalSearchParams<{ id: string }>();
 return <CareerJourneyDetail key={String(id)} id={String(id)} />;
}
