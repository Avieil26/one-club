import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Image as SvgImage, Polygon } from 'react-native-svg';

import { ICON_MOMENTS, type TrophyKind } from '@/lib/iconMoments';

const STAGE_W = 1280;
const STAGE_H = 720;
/** Same crop as Maradona: the case and frame sit to the right of the card. */
const ANCHOR_X = 0.78;
const ANCHOR_Y = 0.5;
/**
 * Inner lip of the gold frame on the 1280×720 plate.
 * The opening is a trapezoid: the top rail rises toward the right, the bottom rail drops.
 * A rectangle always leaves a black wedge on one side.
 */
const OPENING: ReadonlyArray<readonly [number, number]> = [
  [1016, 128],
  [1224, 103],
  [1224, 452],
  [1016, 442],
];
const OPEN_MIN_X = Math.min(...OPENING.map((p) => p[0]));
const OPEN_MIN_Y = Math.min(...OPENING.map((p) => p[1]));
const OPEN_W = Math.max(...OPENING.map((p) => p[0])) - OPEN_MIN_X;
const OPEN_H = Math.max(...OPENING.map((p) => p[1])) - OPEN_MIN_Y;

const PLATE: Record<TrophyKind | 'none', number> = {
  worldcup: require('@/assets/images/museum/plate-worldcup.jpg'),
  ucl: require('@/assets/images/museum/plate-ucl.jpg'),
  euro: require('@/assets/images/museum/plate-euro.jpg'),
  wwc: require('@/assets/images/museum/plate-wwc.jpg'),
  olympic: require('@/assets/images/museum/plate-olympic.jpg'),
  ballondor: require('@/assets/images/museum/plate-ballondor.jpg'),
  premier: require('@/assets/images/museum/plate-premier.jpg'),
  libertadores: require('@/assets/images/museum/plate-libertadores.jpg'),
  europa: require('@/assets/images/museum/plate-europa.jpg'),
  none: require('@/assets/images/museum/plate-empty.jpg'),
};

/** Museum room: World Cup inside a glass case, the lift photo in a wall frame. */
export function MaradonaBackdrop() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#070605' }]}>
      <Image
        source={require('@/assets/images/museum/maradona-bg.png')}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, { objectFit: 'cover', objectPosition: '78% center' } as never]}
      />
    </View>
  );
}

/** Same room for every other icon: their trophy is already in the case, their photo fills the frame. */
export function IconMuseumBackdrop({ playerId }: { playerId: string }) {
  const moment = ICON_MOMENTS[playerId];
  const [box, setBox] = useState({ w: 0, h: 0 });
  const plate =
    playerId === 'icon-pele'
      ? require('@/assets/images/museum/plate-worldcup-3.jpg')
      : PLATE[moment?.trophy ?? 'none'];
  const photo = moment?.photo ?? null;
  const scale = box.w > 0 && box.h > 0 ? Math.max(box.w / STAGE_W, box.h / STAGE_H) : 0;
  const drawnW = STAGE_W * scale;
  const drawnH = STAGE_H * scale;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: '#070605' }]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((prev) => (prev.w === width && prev.h === height ? prev : { w: width, h: height }));
      }}
    >
      {scale > 0 ? (
        <View
          style={{
            position: 'absolute',
            left: ANCHOR_X * (box.w - drawnW),
            top: ANCHOR_Y * (box.h - drawnH),
            width: drawnW,
            height: drawnH,
            direction: 'ltr',
          }}
        >
          <Image
            source={plate}
            resizeMode="stretch"
            style={{ width: drawnW, height: drawnH, objectFit: 'fill' } as never}
          />
          {photo ? (
            <Svg
              width={drawnW}
              height={drawnH}
              style={{ position: 'absolute', left: 0, top: 0 }}
              pointerEvents="none"
            >
              <Defs>
                <ClipPath id={`frame-${playerId}`}>
                  <Polygon points={OPENING.map(([x, y]) => `${x * scale},${y * scale}`).join(' ')} />
                </ClipPath>
              </Defs>
              <SvgImage
                href={photo}
                xlinkHref={photo}
                x={OPEN_MIN_X * scale}
                y={OPEN_MIN_Y * scale}
                width={OPEN_W * scale}
                height={OPEN_H * scale}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#frame-${playerId})`}
              />
            </Svg>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
