import { Defs, G, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

// A shared, player-free frame drawn from the approved orange crystal reference.
// Coordinates use ShieldPortrait's existing 240 × 348 canvas; foreground is untouched.
export const STAR_OUTLINE = 'M16 40 L70 19 L82 10 Q94 29 108 17 L120 5 L132 17 Q146 29 158 10 L170 19 L224 40 L224 268 Q224 303 190 313 L142 330 L120 341 L98 330 L50 313 Q16 303 16 268 Z';
export const STAR_INNER = 'M23 45 L72 26 L82 19 Q95 36 111 23 L120 14 L129 23 Q145 36 158 19 L168 26 L217 45 L217 266 Q217 296 187 306 L139 323 L120 333 L101 323 L53 306 Q23 296 23 266 Z';

const facets = [
  ['23,45 72,26 65,84', '#FD6D08'], ['72,26 98,52 65,84', '#FFC640'],
  ['72,26 111,23 98,52', '#9F2403'], ['111,23 129,23 114,96 98,52', '#FF9309'],
  ['129,23 158,19 146,64 114,96', '#FFB11A'], ['158,19 183,32 146,64', '#F75903'],
  ['183,32 217,45 198,87 146,64', '#FF9A0D'], ['217,45 217,106 198,87', '#FFD65B'],
  ['23,45 65,84 23,113', '#6A1704'], ['65,84 98,52 88,126', '#E14A02'],
  ['98,52 114,96 88,126', '#FFD355'], ['114,96 146,64 146,119 126,153', '#FF6A00'],
  ['146,64 198,87 146,119', '#B83302'], ['198,87 217,106 146,119', '#FFB322'],
  ['217,106 217,148 166,159 146,119', '#F95B00'], ['217,148 217,182 166,159', '#FFCB40'],
  ['23,113 65,84 58,151', '#1F0A04'], ['65,84 88,126 58,151', '#FF7A03'],
  ['88,126 114,96 126,153', '#B73402'], ['58,151 88,126 126,153 95,186', '#FF9D09'],
  ['126,153 146,119 166,159 151,194', '#FFB91C'], ['166,159 217,182 151,194', '#B23703'],
  ['23,113 58,151 23,197', '#3E1003'], ['23,197 58,151 61,207', '#A12D02'],
  ['58,151 95,186 61,207', '#FF5A00'], ['95,186 126,153 151,194 122,221', '#DA4302'],
  ['151,194 217,182 192,226', '#FF7904'], ['217,182 217,247 192,226', '#E44D02'],
  ['23,197 61,207 23,257', '#F77406'], ['61,207 95,186 81,242', '#7C1D03'],
  ['95,186 122,221 81,242', '#FF970A'], ['122,221 151,194 192,226 159,248', '#F45D02'],
] as const;

// Smaller facets within each crystal keep the surface fractured at card and thumbnail sizes.
const shards = facets.flatMap(([points], index) => {
  const vertices = points.split(' ').map((point) => point.split(',').map(Number));
  const center = [0, 1].map((axis) => vertices.reduce((sum, point) => sum + point[axis], 0) / vertices.length);
  return vertices.map((point, edge) => ({
    points: [point, vertices[(edge + 1) % vertices.length], center].map((vertex) => vertex.join(',')).join(' '),
    fill: (index + edge) % 3 === 0 ? '#FFF2AA' : '#8A1B00',
    opacity: (index + edge) % 3 === 0 ? 0.18 : 0.12,
  }));
});

export function StarPerformerBackground({ id, foreground = false }: { id: string; foreground?: boolean }) {
  if (foreground) return <>
    <Path d={STAR_INNER} fill="none" stroke="#FFB52C" strokeWidth="1.1" />
    <Path d="M94 28 Q108 34 120 14 Q132 34 146 28 L133 47 L120 57 L107 47 Z" fill="#241003" />
    <Path d="M111 41 L117 40 L120 32 L123 40 L130 41 L124 46 L126 53 L120 49 L114 53 L115 46 Z" fill="#FFB52C" />
    <Path d="M28 61 V264 Q28 291 55 300 M212 61 V264 Q212 291 185 300" fill="none" stroke="#FF6905" strokeWidth="1" />
  </>;
  return <>
    <Defs>
      <LinearGradient id={`${id}-crystal-rim`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFEF9B" /><Stop offset="0.24" stopColor="#FF7A00" />
        <Stop offset="0.48" stopColor="#FFD34A" /><Stop offset="0.7" stopColor="#F34900" />
        <Stop offset="1" stopColor="#FFB72B" />
      </LinearGradient>
      <LinearGradient id={`${id}-crystal-shade`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#351002" stopOpacity="0" />
        <Stop offset="0.48" stopColor="#441002" stopOpacity="0" />
        <Stop offset="0.73" stopColor="#571501" stopOpacity="0.82" />
        <Stop offset="1" stopColor="#210902" />
      </LinearGradient>
    </Defs>
    <Path d={STAR_OUTLINE} fill="none" stroke="#FF5A00" strokeWidth="9" opacity="0.14" />
    <Path d={STAR_OUTLINE} fill="#4E1302" stroke="#FF7B05" strokeWidth="4" />
    <Path d={STAR_OUTLINE} fill="none" stroke={`url(#${id}-crystal-rim)`} strokeWidth="1.8" />
    <G clipPath={`url(#${id}-clip)`}>
      <Path d={STAR_INNER} fill="#5D1702" />
      {facets.map(([points, fill]) => <Polygon key={points} points={points} fill={fill} />)}
      {shards.map((shard) => <Polygon key={shard.points} {...shard} />)}
      <Path d="M30 155 L78 113 L111 147 M145 72 L173 45 M167 160 L208 137 M38 217 L59 232" fill="none" stroke="#FFE196" strokeWidth="0.8" opacity="0.8" />
      <Path d={STAR_INNER} fill={`url(#${id}-crystal-shade)`} />
      <Path d="M40 107 l3 -7 2 7 -2 5 Z M191 100 l3 -7 2 7 -2 4 Z M202 158 l2 -6 2 6 -2 3 Z M67 46 l2 -5 2 5 -2 4 Z" fill="#FFF0B9" />
    </G>
  </>;
}
