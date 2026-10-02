import type { ImageSourcePropType } from 'react-native';

import type { CareerChallenge, CareerMode } from '@/lib/types';

export type CareerCardTheme = {
  background: string;
  accent: string;
  ink: string;
  inset: string;
  stripe: readonly [string, string, string];
  photo: ImageSourcePropType | null;
  photoPosition: string;
  panelLabel: string;
};

const cream = '#F4F1E6';

const leeds: CareerCardTheme = {
  background: '#0C1C38',
  accent: '#FFD100',
  ink: '#10284A',
  inset: '#1D428A',
  stripe: ['#1D428A', cream, '#FFD100'],
  photo: require('@/assets/images/career/leeds-raphinha.jpg'),
  photoPosition: '50% 12%',
  panelLabel: 'לידס',
};

const promotion: CareerCardTheme = {
  background: '#2A1208',
  accent: '#FF8A3D',
  ink: '#3A1608',
  inset: '#E25A12',
  stripe: ['#8A3410', cream, '#FF7A1A'],
  photo: require('@/assets/images/career/promotion-bellingham.jpg'),
  photoPosition: '50% 42%',
  panelLabel: 'עלייה',
};

const academy: CareerCardTheme = {
  background: '#071610',
  accent: '#7DFFB2',
  ink: '#072016',
  inset: '#148F5B',
  stripe: ['#0E3D2C', cream, '#3DDC97'],
  photo: require('@/assets/images/career/academy-garnacho.jpg'),
  photoPosition: '62% 42%',
  panelLabel: 'אקדמיה',
};

const debut: CareerCardTheme = {
  background: '#1A0B10',
  accent: '#FF8FA3',
  ink: '#2A0A12',
  inset: '#B4233C',
  stripe: ['#6B1D32', cream, '#E23B57'],
  photo: require('@/assets/images/career/debut-garnacho.jpg'),
  photoPosition: '78% 38%',
  panelLabel: 'שער',
};

const fallbacks: Record<CareerMode, CareerCardTheme> = {
  player: {
    background: '#10182A',
    accent: '#9CC7FF',
    ink: '#0C1830',
    inset: '#2E5FA8',
    stripe: ['#1A3058', cream, '#9CC7FF'],
    photo: null,
    photoPosition: '50% 50%',
    panelLabel: 'שחקן',
  },
  manager: {
    background: '#101E16',
    accent: '#7DFFB2',
    ink: '#072016',
    inset: '#148F5B',
    stripe: ['#0E3D2C', cream, '#3DDC97'],
    photo: null,
    photoPosition: '50% 50%',
    panelLabel: 'מאמן',
  },
};

const byId: Record<string, CareerCardTheme> = {
  'ch-leeds-title': leeds,
  'ch-championship-promotion': promotion,
  'ch-academy': academy,
  'ch-debut': debut,
};

export function careerThemeFor(challenge: Pick<CareerChallenge, 'id' | 'mode'>): CareerCardTheme {
  return byId[challenge.id] ?? fallbacks[challenge.mode];
}

export const careerCream = cream;
export const careerFont = 'Heebo';
