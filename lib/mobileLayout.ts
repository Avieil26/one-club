import type { Formation } from '@/lib/chemistry';

export function spotsFor(formation: Formation): Record<string, { x: number; y: number }> {
  const drawn = SPOTS[formation.id];
  if (drawn && formation.lines.flat().every((slot) => drawn[slot.id])) return drawn;
  const spots: Record<string, { x: number; y: number }> = {};
  const rows = formation.lines.length;
  formation.lines.forEach((line, row) => {
    const y = rows === 1 ? 0.5 : 0.1 + (row / (rows - 1)) * 0.78;
    line.forEach((slot, index) => {
      const x = line.length === 1 ? 0.5 : 0.08 + (index / (line.length - 1)) * 0.84;
      spots[slot.id] = { x, y };
    });
  });
  return spots;
}

const SPOTS: Record<string, Record<string, { x: number; y: number }>> = {
  // Retain persisted slot IDs while drawing the actual Holding / Defend / Attack positions.
  '433-2': {lw:{x:0.18,y:0.10},rw:{x:0.82,y:0.10},lb:{x:0.12,y:0.73},lcb:{x:0.37,y:0.75},rcb:{x:0.63,y:0.75},rb:{x:0.88,y:0.73},gk:{x:0.5,y:0.97},st:{x:0.5,y:0.09},lcdm:{x:0.24,y:0.31},rcdm:{x:0.76,y:0.31},cm:{x:0.5,y:0.51}},
  '433-3': {lw:{x:0.18,y:0.10},rw:{x:0.82,y:0.10},lb:{x:0.12,y:0.73},lcb:{x:0.37,y:0.75},rcb:{x:0.63,y:0.75},rb:{x:0.88,y:0.73},gk:{x:0.5,y:0.97},cf:{x:0.5,y:0.09},cam:{x:0.5,y:0.35},lcm:{x:0.24,y:0.53},rcm:{x:0.76,y:0.53}},
  '433-4': {lw:{x:0.18,y:0.10},rw:{x:0.82,y:0.10},lb:{x:0.12,y:0.73},lcb:{x:0.37,y:0.75},rcb:{x:0.63,y:0.75},rb:{x:0.88,y:0.73},gk:{x:0.5,y:0.97},st:{x:0.5,y:0.09},cam:{x:0.5,y:0.29},lcm:{x:0.24,y:0.47},rcm:{x:0.76,y:0.47}},
  '433': {
    lw: { x: 0.18, y: 0.13 },
    st: { x: 0.5, y: 0.09 },
    rw: { x: 0.82, y: 0.13 },
    lcm: { x: 0.24, y: 0.36 },
    cm: { x: 0.5, y: 0.42 },
    rcm: { x: 0.76, y: 0.36 },
    lb: { x: 0.12, y: 0.64 },
    lcb: { x: 0.37, y: 0.68 },
    rcb: { x: 0.63, y: 0.68 },
    rb: { x: 0.88, y: 0.64 },
    gk: { x: 0.5, y: 0.88 },
  },
  '442': {
    lst: { x: 0.34, y: 0.11 },
    rst: { x: 0.66, y: 0.11 },
    lm: { x: 0.12, y: 0.36 },
    lcm: { x: 0.37, y: 0.4 },
    rcm: { x: 0.63, y: 0.4 },
    rm: { x: 0.88, y: 0.36 },
    lb: { x: 0.12, y: 0.64 },
    lcb: { x: 0.37, y: 0.68 },
    rcb: { x: 0.63, y: 0.68 },
    rb: { x: 0.88, y: 0.64 },
    gk: { x: 0.5, y: 0.88 },
  },
};

/** Keep every card inside the pitch, including five-player lines on narrow phones. */
export function squadPitchMetrics(width: number, widestLine: number, lineCount = 5) {
  const measuredWidth = Math.max(1, width);
  const columns = Math.max(1, widestLine);
  const cardWidth = Math.max(1, Math.min(columns >= 5 ? 62 : 78, Math.floor((measuredWidth - 24 - (columns - 1) * 6) / columns)));
  const cardHeight = Math.round(cardWidth * 1.42);
  const rowSpacing = Math.min(0.2, 0.78 / Math.max(1, lineCount - 1));
  return {
    cardWidth,
    cardHeight,
    height: Math.max(500, Math.min(720, Math.round(measuredWidth * 1.7)), Math.ceil((cardHeight + 8) / rowSpacing + cardHeight + 44)),
  };
}

export function pitchCardPosition(x: number, y: number, width: number, height: number, cardWidth: number, cardHeight: number) {
  return {
    left: Math.max(6, Math.min(width - cardWidth - 6, x * width - cardWidth / 2)),
    top: 32 + y * (height - cardHeight - 44),
  };
}
