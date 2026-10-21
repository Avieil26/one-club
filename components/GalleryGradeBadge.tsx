import Svg, { Defs, LinearGradient, Stop, Path, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';
import { useId } from 'react';
import type { GalleryGrade } from '@/lib/galleryTypes';

// Each tier has its own metal, silhouette and engraved details.
export const gradeMetals = {
 D: { light: '#CFD7DB', mid: '#75858F', dark: '#29343C' },
 C: { light: '#F2C7A1', mid: '#AD7650', dark: '#493024' },
 B: { light: '#FFE5AA', mid: '#CBA65C', dark: '#554021' },
 A: { light: '#E3F4FF', mid: '#95B9D5', dark: '#344C68' },
 S: { light: '#FFF1BD', mid: '#DEB653', dark: '#6B3F17' },
} as const;
const outlines: Record<GalleryGrade, string> = {
 D: 'M18 16H62V51L40 69 18 51Z',
 C: 'M40 9 67 23V51L40 73 13 51V23Z',
 B: 'M40 6 72 40 40 75 8 40Z',
 A: 'M40 5 70 19 73 48 40 76 7 48 10 19Z',
 S: 'M14 21 22 10 32 17 40 5 48 17 58 10 66 21 70 52 40 77 10 52Z',
};
export function GalleryGradeBadge({ grade, size = 62, muted = false }: { grade: GalleryGrade; size?: number; muted?: boolean }) {
 const metal = gradeMetals[grade];
 const gradientId = `grade-metal-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
 return <View accessibilityLabel={`Grade ${grade}`} style={{ width: size, height: size, opacity: muted ? 0.55 : 1 }}>
  <Svg width={size} height={size} viewBox="0 0 80 84">
   <Defs><LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={metal.light}/><Stop offset="0.48" stopColor={metal.mid}/><Stop offset="0.7" stopColor={metal.light}/><Stop offset="1" stopColor={metal.dark}/></LinearGradient></Defs>
   <Path d={outlines[grade]} fill={metal.dark} stroke={`url(#${gradientId})`} strokeWidth="3"/>
   <Path d={outlines[grade]} transform="translate(6 6) scale(.85)" fill="#101820" stroke={metal.mid} strokeWidth="0.9"/>
   <Path d="M23 25H57M26 58H54" stroke={metal.mid} strokeWidth="0.7" opacity=".6"/>
   <SvgText x="40" y="51" fill={metal.light} textAnchor="middle" fontFamily="Arial" fontSize="31" fontWeight="800">{grade}</SvgText>
   {grade === 'S' ? <Path d="m34 66 6-4 6 4-6 4Z" fill={metal.light}/> : null}
  </Svg>
 </View>;
}
