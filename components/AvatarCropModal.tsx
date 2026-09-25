import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { colors } from '@/components/ui';

type Props = {
  uri: string;
  visible: boolean;
  onCancel: () => void;
  onConfirm: (croppedDataUri: string) => void;
};

const VIEW = 280;
const OUT = 512;
const MAX_PAN = VIEW * 0.85;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Instagram-style circular crop.
 * What you see inside the circle is exactly what gets saved and shown on the card.
 */
export function AvatarCropModal({ uri, visible, onCancel, onConfirm }: Props) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setPan({ x: 0, y: 0 });
    panRef.current = { x: 0, y: 0 };
    setNatural(null);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const img = new window.Image();
      img.onload = () => setNatural({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      img.onerror = () => setNatural({ w: 1000, h: 1000 });
      img.src = uri;
      return;
    }
    Image.getSize(
      uri,
      (w, h) => setNatural({ w, h }),
      () => setNatural({ w: 1000, h: 1000 }),
    );
  }, [uri, visible]);

  const coverScale = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1;
  const drawW = (natural?.w ?? VIEW) * coverScale;
  const drawH = (natural?.h ?? VIEW) * coverScale;
  const baseLeft = (VIEW - drawW) / 2;
  const baseTop = (VIEW - drawH) / 2;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startRef.current = { ...panRef.current };
      },
      onPanResponderMove: (_: GestureResponderEvent, g) => {
        const next = {
          x: clamp(startRef.current.x + g.dx, -MAX_PAN, MAX_PAN),
          y: clamp(startRef.current.y + g.dy, -MAX_PAN, MAX_PAN),
        };
        panRef.current = next;
        setPan(next);
      },
    }),
  ).current;

  async function confirm() {
    if (!natural) return;
    setBusy(true);
    try {
      if (Platform.OS !== 'web' || typeof document === 'undefined') {
        // Native: without canvas, bake crop via offscreen not available — still pass URI;
        // web is primary for Vercel. Prefer asking web users for crop.
        onConfirm(uri);
        return;
      }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('לא הצלחנו לטעון את התמונה לחיתוך'));
        img.src = uri;
      });

      const scale = Math.max(VIEW / img.naturalWidth, VIEW / img.naturalHeight);
      const left = (VIEW - img.naturalWidth * scale) / 2 + panRef.current.x;
      const top = (VIEW - img.naturalHeight * scale) / 2 + panRef.current.y;
      // Exact square visible in the circle viewport, in source-image pixels:
      const srcX = (0 - left) / scale;
      const srcY = (0 - top) / scale;
      const srcSize = VIEW / scale;

      const canvas = document.createElement('canvas');
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        onConfirm(uri);
        return;
      }
      ctx.fillStyle = '#0A100E';
      ctx.fillRect(0, 0, OUT, OUT);
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT);
      // Circular soft edge not needed — card already clips to circle.
      // But export as circle-masked PNG so corners don't show if layout fails:
      const circle = document.createElement('canvas');
      circle.width = OUT;
      circle.height = OUT;
      const cctx = circle.getContext('2d');
      if (!cctx) {
        onConfirm(canvas.toDataURL('image/jpeg', 0.92));
        return;
      }
      cctx.beginPath();
      cctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
      cctx.closePath();
      cctx.clip();
      cctx.drawImage(canvas, 0, 0);
      onConfirm(circle.toDataURL('image/png'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'החיתוך נכשל';
      // Still try JPEG square crop without circle mask
      try {
        if (typeof document !== 'undefined' && natural) {
          const img = new window.Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = uri;
          });
          const scale = Math.max(VIEW / img.naturalWidth, VIEW / img.naturalHeight);
          const left = (VIEW - img.naturalWidth * scale) / 2 + panRef.current.x;
          const top = (VIEW - img.naturalHeight * scale) / 2 + panRef.current.y;
          const canvas = document.createElement('canvas');
          canvas.width = OUT;
          canvas.height = OUT;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, (0 - left) / scale, (0 - top) / scale, VIEW / scale, VIEW / scale, 0, 0, OUT, OUT);
          onConfirm(canvas.toDataURL('image/jpeg', 0.92));
          return;
        }
      } catch {
        /* fall through */
      }
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', padding: 20 }}>
        <Text style={{ color: '#F7F4EA', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>
          בחר אזור לפנים
        </Text>
        <Text style={{ color: 'rgba(247,244,234,0.75)', textAlign: 'center', marginBottom: 18 }}>
          גרור שמאלה / ימינה / למעלה / למטה — מה שבתוך העיגול יישמר בכרטיס
        </Text>

        {/* Dimmed full photo behind, sharp circle in front */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: VIEW,
              height: VIEW,
              borderRadius: VIEW / 2,
              overflow: 'hidden',
              backgroundColor: '#111',
              borderWidth: 3,
              borderColor: '#7ED0C8',
            }}
            {...responder.panHandlers}
          >
            {natural ? (
              <Image
                source={{ uri }}
                resizeMode="stretch"
                style={{
                  position: 'absolute',
                  width: drawW,
                  height: drawH,
                  left: baseLeft + pan.x,
                  top: baseTop + pan.y,
                }}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#aaa' }}>טוען…</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28, justifyContent: 'center' }}>
          <Pressable
            onPress={onCancel}
            style={{ paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <Text style={{ color: '#F7F4EA', fontWeight: '700' }}>ביטול</Text>
          </Pressable>
          <Pressable
            disabled={!natural || busy}
            onPress={() => {
              confirm().catch((error) => {
                const msg = error instanceof Error ? error.message : 'החיתוך נכשל';
                if (Platform.OS === 'web') window.alert(msg);
              });
            }}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 22,
              borderRadius: 12,
              backgroundColor: colors.green,
              opacity: !natural || busy ? 0.5 : 1,
            }}
          >
            <Text style={{ color: colors.greenInk, fontWeight: '800' }}>{busy ? 'שומר…' : 'אישור'}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
