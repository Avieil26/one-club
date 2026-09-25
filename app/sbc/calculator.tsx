import { useMemo, useState } from 'react';
import { Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { Card, ChoiceGroup, colors, Field, Muted, Screen, Title } from '@/components/ui';
import { DEFAULT_ITEM_SCORES, buildStrategies } from '@/lib/sbcCalculator';

const OVRS = Object.keys(DEFAULT_ITEM_SCORES).map(Number);

export default function CalculatorScreen() {
  const params = useLocalSearchParams<{ target?: string }>();
  const [target, setTarget] = useState(params.target ?? '20000');
  const [minOvr, setMinOvr] = useState(75);
  const [scores, setScores] = useState<Record<number, string>>(
    Object.fromEntries(OVRS.map((ovr) => [ovr, String(DEFAULT_ITEM_SCORES[ovr])])),
  );

  const strategies = useMemo(() => {
    const numeric: Record<number, number> = {};
    for (const ovr of OVRS) {
      const value = Number(scores[ovr]);
      if (Number.isInteger(value) && value > 0) numeric[ovr] = value;
    }
    return buildStrategies(Number(target), minOvr, numeric);
  }, [minOvr, scores, target]);

  return (
    <Screen scene="sbc">
      <Stack.Screen options={{ title: '׳׳—׳©׳‘׳•׳' }} />
      <Title>׳׳—׳©׳‘׳•׳ Streamlined</Title>
      <Muted>
        ׳›׳ ׳›׳¨׳˜׳™׳¡ ׳ ׳•׳×׳ ׳ ׳™׳§׳•׳“ ׳׳₪׳™ ׳”׳“׳™׳¨׳•׳’. ׳׳₪׳©׳¨ ׳›׳₪׳™׳׳•׳™׳•׳×, ׳•׳׳₪׳©׳¨ ׳׳”׳’׳™׳© ׳—׳׳§ ׳•׳׳—׳–׳•׳¨ ׳׳—׳¨ ׳›׳. ׳”׳׳¡׳₪׳¨׳™׳ ׳”׳ ׳˜׳‘׳׳× ׳”׳”׳©׳§׳” ׳©׳₪׳•׳¨׳¡׳׳” (75 = 90, 83 = 410, 88 = 8,300) ׳•׳׳₪׳©׳¨ ׳׳¢׳¨׳•׳ ׳׳•׳×׳, ׳›׳™ EA ׳׳׳¨׳• ׳©׳”׳˜׳‘׳׳” ׳™׳›׳•׳׳” ׳׳”׳©׳×׳ ׳•׳×. ׳׳™׳ ׳׳—׳™׳¨׳™ ׳׳˜׳‘׳¢׳•׳×.
      </Muted>
      <Field label="׳™׳¢׳“ ׳ ׳™׳§׳•׳“" value={target} onChangeText={setTarget} keyboardType="number-pad" />
      <ChoiceGroup
        label="׳“׳™׳¨׳•׳’ ׳׳™׳ ׳™׳׳•׳"
        options={OVRS.map((ovr) => ({ id: String(ovr), label: String(ovr) }))}
        value={String(minOvr)}
        onChange={(value) => setMinOvr(Number(value))}
      />
      {OVRS.map((ovr) => (
        <Field
          key={ovr}
          label={`׳ ׳™׳§׳•׳“ ׳׳›׳¨׳˜׳™׳¡ ${ovr}`}
          value={scores[ovr] ?? ''}
          keyboardType="number-pad"
          onChangeText={(value) => setScores((current) => ({ ...current, [ovr]: value }))}
        />
      ))}
      {strategies.map((strategy) => (
        <Card key={strategy.id}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'right' }}>{strategy.title}</Text>
          {strategy.lines.map((line) => (
            <Muted key={`${strategy.id}-${line.ovr}`}>
              {line.count} ׳›׳¨׳˜׳™׳¡׳™ ׳“׳™׳¨׳•׳’ {line.ovr} ֲ· {line.scoreEach} ׳ ׳§׳•׳“׳•׳× ׳›׳ ׳׳—׳“ ֲ· ׳¡׳”׳´׳› {line.total}
            </Muted>
          ))}
          <Muted>
            {strategy.cardCount} ׳›׳¨׳˜׳™׳¡׳™׳ ׳׳’׳™׳¢׳™׳ ׳-{strategy.totalScore}, ׳׳¢׳ ׳™׳¢׳“ {target || '0'}
          </Muted>
        </Card>
      ))}
    </Screen>
  );
}

