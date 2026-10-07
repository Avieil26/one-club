import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useMarketPrices } from '@/lib/marketPrices';

function coins(amount: number) {
  return amount.toLocaleString('en-US');
}

function Coin({ size }: { size: number }) {
  return <Image source={require('@/assets/images/market-coin.png')} style={{ width: size, height: size }} resizeMode="contain" />;
}

function PlayStationLogo() {
  return <Image source={require('@/assets/images/logo-playstation.png')} style={{ width: 26, height: 20 }} resizeMode="contain" />;
}

function XboxLogo() {
  return <Image source={require('@/assets/images/logo-xbox.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />;
}

function ComputerLogo() {
  return (
    <Svg width={20} height={18} viewBox="0 0 20 18">
      <Rect x={1.4} y={1.4} width={17.2} height={11} rx={1.4} stroke="#F4F7F2" strokeWidth={1.5} fill="none" />
      <Path d="M7 16.2h6M10 12.4v3.8" stroke="#F4F7F2" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
      <Svg width={12} height={12} viewBox="0 0 12 12">
        <Path d="M2.2 4.2L6 8l3.8-3.8" stroke="#C5CDD6" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export function MarketQuote({ compact, console: consolePrice, pc }: { compact?: boolean; console?: number; pc?: number }) {
  useMarketPrices();
  const [mode, setMode] = useState<'console' | 'pc'>('console');
  const [open, setOpen] = useState(false);
  const amount = mode === 'console' ? consolePrice : pc;
  const hasAmount = typeof amount === 'number';

  const digits = hasAmount ? String(amount).length : 0;
  const calcPriceSize = compact
    ? digits >= 7
      ? 16
      : digits >= 6
        ? 18
        : 20
    : digits >= 7
      ? 26
      : digits >= 6
        ? 30
        : 36;

  function choose(next: 'console' | 'pc') {
    setMode(next);
    setOpen(false);
  }

  return (
    <View
      style={{
        alignSelf: 'stretch',
        maxWidth: 280,
        backgroundColor: '#141414',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: compact ? 10 : 14,
        paddingTop: compact ? 10 : 14,
        paddingBottom: compact ? 10 : 14,
        gap: compact ? 8 : 12,
        direction: 'ltr',
      }}
    >
      <View style={{ alignItems: 'flex-start', zIndex: 2 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mode === 'console' ? 'קונסולות' : 'מחשב'}
          onPress={() => setOpen((value) => !value)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#1C1C1C',
            borderRadius: 999,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            paddingHorizontal: compact ? 10 : 12,
            paddingVertical: compact ? 5 : 7,
          }}
        >
          {mode === 'console' ? (
            <>
              <PlayStationLogo />
              <XboxLogo />
            </>
          ) : (
            <ComputerLogo />
          )}
          <Chevron open={open} />
        </Pressable>
        {open ? (
          <View
            style={{
              marginTop: 6,
              backgroundColor: '#1C1C1C',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <Pressable onPress={() => choose('console')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
              <PlayStationLogo />
              <XboxLogo />
            </Pressable>
            <Pressable onPress={() => choose('pc')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10 }}>
              <ComputerLogo />
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%', minWidth: 0 }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={{
            flexShrink: 1,
            color: hasAmount ? '#F7F7F7' : '#8E96A3',
            fontSize: hasAmount ? calcPriceSize : 14,
            fontWeight: '900',
            letterSpacing: 0.2,
            writingDirection: hasAmount ? 'ltr' : 'rtl',
          }}
        >
          {hasAmount ? coins(amount as number) : 'אין מחיר'}
        </Text>
        {hasAmount ? <Coin size={compact ? 18 : 24} /> : null}
      </View>
    </View>
  );
}
