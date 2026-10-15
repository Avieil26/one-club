import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CareerChallengeCard } from '@/components/CareerChallengeCard';
import { Button, Muted, Screen, Title } from '@/components/ui';
import { CareerScoutView } from '@/components/CareerScoutView';
import { CAREER_SCOUT_PLAYERS } from '@/lib/careerScoutData';
import { useApp } from '@/lib/store';
import { useLanguage } from '@/lib/language';

export default function CareerScreen() {
  const app = useApp();
  const { language, t } = useLanguage();
  const rtl = language === 'he';
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [careerTab, setCareerTab] = useState<'scout' | 'challenges'>(
    params.tab === 'challenges' ? 'challenges' : 'scout',
  );

  return (
    <Screen refreshing={app.busy} onRefresh={app.refresh} scene="career">
      {/* MODE SWITCHER TABS */}
      <View style={styles.tabSwitcher}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setCareerTab('scout')}
          style={[styles.switchBtn, careerTab === 'scout' && styles.switchBtnActive]}
        >
          <Text style={[styles.switchBtnText, careerTab === 'scout' && styles.switchBtnTextActive]}>
            🌟 {t('סקאוטינג כישרונות', 'Talent scouting')} ({CAREER_SCOUT_PLAYERS.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setCareerTab('challenges')}
          style={[styles.switchBtn, careerTab === 'challenges' && styles.switchBtnActive]}
        >
          <Text
            style={[
              styles.switchBtnText,
              careerTab === 'challenges' && styles.switchBtnTextActive,
            ]}
          >
            🏆 {t('אתגרי קריירה', 'Career challenges')}
          </Text>
        </Pressable>
      </View>

      {careerTab === 'scout' ? (
        <CareerScoutView onSwitchToChallenges={() => setCareerTab('challenges')} />
      ) : (
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
    flexDirection: rtl ? 'row-reverse' : 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 6,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnActive: {
    backgroundColor: 'rgba(0, 255, 140, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff8c',
  },
  switchBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
  },
  switchBtnTextActive: {
    color: '#00ff8c',
    fontWeight: '900',
  },
});
