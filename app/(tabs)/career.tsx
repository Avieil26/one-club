import { CareerJourneysList } from '@/components/CareerJourneys';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CareerChallengeCard } from '@/components/CareerChallengeCard';
import { Button, Muted, Screen, Title } from '@/components/ui';
import { CareerScoutView } from '@/components/CareerScoutView';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';

export default function CareerScreen() {
  const app = useApp();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [careerTab, setCareerTab] = useState<'scout' | 'challenges' | 'journeys'>(
    params.tab === 'journeys' ? 'journeys' : params.tab === 'challenges' ? 'challenges' : 'scout',
  );

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="career">
      <View accessibilityRole="tablist" style={[styles.tabSwitcher, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
        {([
          { id: 'scout', label: t('סקאוטינג', 'Scouting') },
          { id: 'challenges', label: t('אתגרי קריירה', 'Challenges') },
          { id: 'journeys', label: t('מסעות משותפים', 'Shared journeys') },
        ] as const).map((tab) => <Pressable key={tab.id} accessibilityRole="tab" accessibilityState={{ selected: careerTab === tab.id }} onPress={() => { setCareerTab(tab.id); router.setParams({ tab: tab.id }); }} style={[styles.switchBtn, careerTab === tab.id && styles.switchBtnActive]}>
          <Text style={[styles.switchBtnText, careerTab === tab.id && styles.switchBtnTextActive]}>{tab.label}</Text>
        </Pressable>)}
      </View>

      {careerTab === 'scout' ? (
        <CareerScoutView onSwitchToChallenges={() => setCareerTab('challenges')} />
      ) : careerTab === 'journeys' ? <CareerJourneysList embedded /> : (
        <View style={{ gap: 14 }}>
          <Title>{t('אתגרי קריירה', 'Career challenges')}</Title>
          <Muted>{t('אתגר, צילום, וקרדיט אחרי אישור. אחרי 5 אישורים ההגשה עולה מיד.', 'Complete a challenge, upload proof, and earn credit after approval. After 5 approvals, your submission is published immediately.')}</Muted>
          {app.user?.isAdmin ? (
            <Button label={t('אתגר חדש', 'New challenge')} onPress={() => router.push('/career/new')} />
          ) : null}
          <View style={{ gap: 14 }}>
            {app.challenges.map((challenge) => (
              <CareerChallengeCard
                key={challenge.id}
                challenge={challenge}
                onPress={() => router.push(`/career/${challenge.id}`)}
              />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabSwitcher: {
    flexDirection: 'row-reverse',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 7,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 6,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 4,
    minHeight: 48,
    minWidth: 0,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnActive: {
    backgroundColor: 'rgba(0, 255, 140, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff8c',
  },
  switchBtnText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '800',
    color: '#94a3b8',
  },
  switchBtnTextActive: {
    color: '#00ff8c',
    fontWeight: '900',
  },
});
