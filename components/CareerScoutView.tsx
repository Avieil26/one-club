import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ClubBadge } from '@/components/ClubBadge';
import { NationFlag } from '@/components/NationFlag';
import {
  CAREER_SCOUT_PLAYERS,
  CareerScoutPlayer,
} from '@/lib/careerScoutData';
import {
  CAREER_PLAYER_PHOTOS,
} from '@/lib/careerScoutAssets';
import {
  getCareerAttributes,
  getDetailedGroups,
  DetailedAttrGroup,
} from '@/lib/careerAttributes';
import { statTone } from '@/lib/playerMeta';

type FilterTab = 'all' | 'israel' | 'attack' | 'midfield' | 'defense';

type SubFilterTab = 'all' | 'wonderkids' | 'bargains' | '70-77';

function formatEur(val: number): string {
  if (val >= 1_000_000) {
    const m = (val / 1_000_000).toFixed(1).replace('.0', '');
    return `€${m}M`;
  }
  return `€${(val / 1_000).toFixed(0)}K`;
}

function formatEurFull(val: number): string {
  return '€' + val.toLocaleString('en-US');
}

export function CareerScoutView({ onSwitchToChallenges }: { onSwitchToChallenges?: () => void }) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [subFilter, setSubFilter] = useState<SubFilterTab>('all');
  const [page, setPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<CareerScoutPlayer | null>(null);

  const PAGE_SIZE = 12;

  const filteredPlayers = CAREER_SCOUT_PLAYERS.filter((p) => {
    // Primary position / nation filter
    if (activeTab === 'israel' && p.nation !== 'ישראל') return false;
    if (activeTab === 'attack' && !['ST', 'RW', 'LW', 'RM', 'LM'].includes(p.position)) return false;
    if (activeTab === 'midfield' && !['CAM', 'CM', 'CDM'].includes(p.position)) return false;
    if (activeTab === 'defense' && !['CB', 'LB', 'RB', 'GK'].includes(p.position)) return false;

    // Sub-filter
    if (subFilter === '70-77' && (p.rating < 70 || p.rating > 77)) return false;
    if (subFilter === 'wonderkids' && p.category !== 'wonderkids') return false;
    if (subFilter === 'bargains' && p.category !== 'bargains') return false;

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + PAGE_SIZE);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSubFilterChange = (sub: SubFilterTab) => {
    setSubFilter(sub);
    setPage(1);
  };

  return (
    <View style={styles.container}>
      {/* TOP HEADER */}
      <View style={styles.topRow}>
        {onSwitchToChallenges ? (
          <Pressable accessibilityRole="button" onPress={onSwitchToChallenges} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ אתגרי קריירה</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <View style={styles.careerBadge}>
          <View style={styles.greenDot} />
          <Text style={styles.careerBadgeText}>{CAREER_SCOUT_PLAYERS.length} שחקנים מומלצים</Text>
        </View>
      </View>

      {/* TITLE */}
      <View style={styles.titleBlock}>
        <Text style={styles.mainTitle}>סקאוטינג כישרונות FC 27</Text>
        <Text style={styles.subTitle}>
          שחקנים עם פוטנציאל התפתחות אדיר מכל העמדות • כולל שחקנים כחול-לבן 🇮🇱
        </Text>
      </View>

      {/* FILTER TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={styles.filterBar}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => handleTabChange('all')}
          style={[styles.filterPill, activeTab === 'all' && styles.filterPillActive]}
        >
          <Text style={[styles.filterPillText, activeTab === 'all' && styles.filterPillTextActive]}>
            הכל ({CAREER_SCOUT_PLAYERS.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleTabChange('israel')}
          style={[
            styles.filterPill,
            styles.israelFilterPill,
            activeTab === 'israel' && styles.israelFilterPillActive,
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
              styles.israelFilterText,
              activeTab === 'israel' && styles.israelFilterTextActive,
            ]}
          >
            🇮🇱 כחול-לבן ({CAREER_SCOUT_PLAYERS.filter(p => p.nation === 'ישראל').length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleTabChange('attack')}
          style={[styles.filterPill, activeTab === 'attack' && styles.filterPillActive]}
        >
          <Text style={[styles.filterPillText, activeTab === 'attack' && styles.filterPillTextActive]}>
            התקפה (ST/W)
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleTabChange('midfield')}
          style={[styles.filterPill, activeTab === 'midfield' && styles.filterPillActive]}
        >
          <Text style={[styles.filterPillText, activeTab === 'midfield' && styles.filterPillTextActive]}>
            קישור (CAM/CM)
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleTabChange('defense')}
          style={[styles.filterPill, activeTab === 'defense' && styles.filterPillActive]}
        >
          <Text style={[styles.filterPillText, activeTab === 'defense' && styles.filterPillTextActive]}>
            הגנה ושוערים
          </Text>
        </Pressable>
      </ScrollView>

      {/* SECONDARY FILTER BAR */}
      <View style={styles.subFilterBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => handleSubFilterChange('all')}
          style={[styles.subFilterBtn, subFilter === 'all' && styles.subFilterBtnActive]}
        >
          <Text style={[styles.subFilterBtnText, subFilter === 'all' && styles.subFilterBtnTextActive]}>
            כל הרמות
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleSubFilterChange('70-77')}
          style={[styles.subFilterBtn, styles.subFilterBtn7077, subFilter === '70-77' && styles.subFilterBtn7077Active]}
        >
          <Text style={[styles.subFilterBtnText, styles.subFilterBtn7077Text, subFilter === '70-77' && styles.subFilterBtn7077TextActive]}>
            ⭐ רייטינג 70–77 ({CAREER_SCOUT_PLAYERS.filter(p => p.rating >= 70 && p.rating <= 77).length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleSubFilterChange('wonderkids')}
          style={[styles.subFilterBtn, subFilter === 'wonderkids' && styles.subFilterBtnActive]}
        >
          <Text style={[styles.subFilterBtnText, subFilter === 'wonderkids' && styles.subFilterBtnTextActive]}>
            💎 וונדרקידס
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => handleSubFilterChange('bargains')}
          style={[styles.subFilterBtn, subFilter === 'bargains' && styles.subFilterBtnActive]}
        >
          <Text style={[styles.subFilterBtnText, subFilter === 'bargains' && styles.subFilterBtnTextActive]}>
            🏷️ מציאות שוק
          </Text>
        </Pressable>
      </View>

      {/* PAGE SUMMARY STRIP */}
      <View style={styles.pageSummaryStrip}>
        <View style={styles.pageSummaryInfo}>
          <Text style={styles.pageSummaryTotal}>
            מציג <Text style={styles.pageSummaryNum}>{filteredPlayers.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + PAGE_SIZE, filteredPlayers.length)}</Text> מתוך <Text style={styles.pageSummaryNum}>{filteredPlayers.length}</Text> שחקנים
          </Text>
          <Text style={styles.pageSummaryPage}>
            עמוד {currentPage} מתוך {totalPages}
          </Text>
        </View>

        {totalPages > 1 ? (
          <View style={styles.quickNavArrows}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="עמוד קודם"
              disabled={currentPage <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              style={[styles.quickNavBtn, currentPage <= 1 && styles.quickNavBtnDisabled]}
            >
              <Text style={[styles.quickNavBtnText, currentPage <= 1 && styles.quickNavBtnTextDisabled]}>‹ הקודם</Text>
            </Pressable>

            <View style={styles.quickNavPageBadge}>
              <Text style={styles.quickNavPageBadgeText}>{currentPage} / {totalPages}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="עמוד הבא"
              disabled={currentPage >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={[styles.quickNavBtn, currentPage >= totalPages && styles.quickNavBtnDisabled]}
            >
              <Text style={[styles.quickNavBtnText, currentPage >= totalPages && styles.quickNavBtnTextDisabled]}>הבא ›</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* PLAYERS LIST */}
      <View style={styles.cardsList}>
        {paginatedPlayers.map((player) => {
          const isIsrael = player.nation === 'ישראל';
          const localPhoto = CAREER_PLAYER_PHOTOS[player.eaId];
          const portraitUri = player.photo;

          return (
            <Pressable
              key={player.id}
              accessibilityRole="button"
              onPress={() => setSelectedPlayer(player)}
              style={[styles.cardItem, isIsrael && styles.cardItemIsrael]}
            >
              {/* SIDE ACCENT BAR */}
              <View
                style={[
                  styles.cardAccentBar,
                  { backgroundColor: isIsrael ? '#38bdf8' : '#00ff8c' },
                ]}
              />

              {/* CUTOUT PHOTO FRAME */}
              <View style={styles.cutoutBox}>
                {localPhoto ? (
                  <Image source={localPhoto} style={styles.portraitImg} resizeMode="contain" />
                ) : portraitUri ? (
                  <Image source={{ uri: portraitUri }} style={styles.portraitImg} resizeMode="contain" />
                ) : (
                  <View style={styles.portraitPlaceholder} />
                )}
                <View
                  style={[
                    styles.posBadge,
                    { backgroundColor: isIsrael ? '#0284c7' : 'rgba(0,0,0,0.85)' },
                  ]}
                >
                  <Text style={styles.posBadgeText}>{player.position}</Text>
                </View>
              </View>

              {/* CARD DETAILS */}
              <View style={styles.cardDetails}>
                {/* NAME & GROWTH */}
                <View style={styles.nameRow}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <View
                    style={[
                      styles.growthPill,
                      isIsrael && {
                        backgroundColor: 'rgba(56, 189, 248, 0.18)',
                        borderColor: 'rgba(56, 189, 248, 0.45)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.growthPillText,
                        isIsrael && { color: '#38bdf8' },
                      ]}
                    >
                      +{player.growth} צמיחה
                    </Text>
                  </View>
                </View>

                {/* CLUB & NATION */}
                <View style={styles.metaRow}>
                  <ClubBadge club={player.club} size={18} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {player.club}
                  </Text>
                  <Text style={styles.metaDot}>•</Text>
                  <NationFlag nation={player.nation} size={14} />
                  <Text style={styles.metaText}>{player.nation}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>בן {player.age}</Text>
                </View>

                {/* RATING & TACTICAL ROLE */}
                <View style={styles.ratingStrip}>
                  <View style={styles.ratingPair}>
                    <Text style={styles.curOvr}>{player.rating}</Text>
                    <Text style={styles.arrowIcon}>➔</Text>
                    <Text style={styles.maxPot}>{player.potential}</Text>
                  </View>
                  <View style={styles.roleChip}>
                    <Text style={styles.roleChipText} numberOfLines={1}>
                      {player.primaryRole}
                    </Text>
                  </View>
                </View>

                {/* VALUE & DOSSIER BUTTON */}
                <View style={styles.valueRow}>
                  <View style={styles.valueGroup}>
                    <Text style={styles.euroVal}>{formatEur(player.marketValueEur)}</Text>
                    <Text style={styles.wageVal}>
                      • שכר: {formatEur(player.weeklyWageEur)}/שבוע
                    </Text>
                  </View>
                  <View style={styles.reportBtn}>
                    <Text style={styles.reportBtnText}>דוח מלא ◄</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* BOTTOM PAGER */}
      {totalPages > 1 ? (
        <View style={styles.bottomPagerBox}>
          <View style={styles.bottomPagerControls}>
            <Pressable
              accessibilityRole="button"
              disabled={currentPage <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              style={[styles.pagerNavBtn, currentPage <= 1 && styles.pagerNavBtnDisabled]}
            >
              <Text style={[styles.pagerNavBtnText, currentPage <= 1 && styles.pagerNavBtnTextDisabled]}>
                ‹ עמוד קודם
              </Text>
            </Pressable>

            <Text style={styles.pagerStatusLabel}>
              עמוד {currentPage} מתוך {totalPages}
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={currentPage >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={[styles.pagerNavBtn, currentPage >= totalPages && styles.pagerNavBtnDisabled]}
            >
              <Text style={[styles.pagerNavBtnText, currentPage >= totalPages && styles.pagerNavBtnTextDisabled]}>
                עמוד הבא ›
              </Text>
            </Pressable>
          </View>

          {/* PAGE NUMBER CHIPS */}
          <View style={styles.pagerChipsWrap}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
              const isActive = pNum === currentPage;
              return (
                <Pressable
                  key={pNum}
                  accessibilityRole="button"
                  onPress={() => setPage(pNum)}
                  style={[styles.pageNumberChip, isActive && styles.pageNumberChipActive]}
                >
                  <Text style={[styles.pageNumberChipText, isActive && styles.pageNumberChipTextActive]}>
                    {pNum}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* ADVISOR BANNER */}
      <View style={styles.advisorStrip}>
        <Text style={styles.advisorEmoji}>🇮🇱</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.advisorText}>
            <Text style={styles.advisorHighlight}>גאווה ישראלית ב-FC 27: </Text>
            אוסקר גלוך באייאקס (86 פוטנציאל), ענאן חלאילי בקריסטל פאלאס (85 פוטנציאל), ודניאל פרץ בסאות׳המפטון (83 פוטנציאל) –
            לצד שחקני מפתח נוספים כמו למקין, קארצב, תורג׳מן, עבדה, קניקובסקי ופיינגולד!
          </Text>
        </View>
      </View>

      {/* SCOUT DOSSIER MODAL */}
      <Modal
        visible={Boolean(selectedPlayer)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPlayer(null)}
      >
        {selectedPlayer ? (
          <ScoutDossierModal
            player={selectedPlayer}
            onClose={() => setSelectedPlayer(null)}
          />
        ) : null}
      </Modal>
    </View>
  );
}

function ScoutDossierModal({
  player,
  onClose,
}: {
  player: CareerScoutPlayer;
  onClose: () => void;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.max(480, Math.round(windowHeight * 0.93));
  const [showPotential, setShowPotential] = useState(false);
  const localPhoto = CAREER_PLAYER_PHOTOS[player.eaId];
  const portraitUri = player.photo;
  const isIsrael = player.nation === 'ישראל';

  const attrBundle = getCareerAttributes(player.id);
  const detailedGroups = attrBundle ? getDetailedGroups(attrBundle, showPotential) : [];
  const currentFace = showPotential && attrBundle ? attrBundle.potentialFace : player.attributes;
  const displayedOvr = showPotential ? player.potential : player.rating;

  return (
    <View style={styles.modalBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.modalSheet, { height: sheetHeight, maxHeight: sheetHeight }]}>
        {/* MODAL HEADER */}
        <View style={styles.modalTopRow}>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseBtnText}>‹ חזרה לשחקנים</Text>
          </Pressable>
          <View style={styles.careerBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.careerBadgeText}>דוח סקאוטינג FC 27</Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, minHeight: 0, width: '100%' }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.modalScrollContent}
          nestedScrollEnabled={true}
          bounces={true}
        >
          {/* HERO PLAYER PROFILE */}
          <View style={[styles.profileHeroCard, isIsrael && styles.profileHeroCardIsrael]}>
            <View style={styles.heroAvatarBox}>
              {localPhoto ? (
                <Image source={localPhoto} style={styles.heroAvatarImg} resizeMode="contain" />
              ) : portraitUri ? (
                <Image source={{ uri: portraitUri }} style={styles.heroAvatarImg} resizeMode="contain" />
              ) : null}
            </View>

            <View style={styles.heroMetaCol}>
              <Text style={styles.heroPlayerTitle} numberOfLines={1}>
                {player.name} {isIsrael ? '🇮🇱' : ''}
              </Text>
              <Text style={styles.heroEnTitle}>
                {player.enName} • {player.club}
              </Text>
              <View style={styles.metaRow}>
                <ClubBadge club={player.club} size={20} />
                <Text style={styles.metaText}>{player.club}</Text>
                <Text style={styles.metaDot}>•</Text>
                <NationFlag nation={player.nation} size={15} />
                <Text style={styles.metaText}>{player.nation}</Text>
              </View>

              <View style={styles.chipsWrap}>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>בן {player.age}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>{player.position}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>{player.height} ס״מ</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>רגל {player.foot}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>★{player.skills} מיומנות</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>★{player.weakFoot} חלשה</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CAREER PROGRESSION */}
          <View style={[styles.progPanel, showPotential && styles.progPanelPotential]}>
            <View style={styles.progHead}>
              <View>
                <Text style={styles.progHeadTitle}>התפתחות בקריירה</Text>
                <View style={styles.progNumbers}>
                  <Text style={styles.numCur}>{player.rating}</Text>
                  <Text style={styles.numArrow}>➔</Text>
                  <Text style={styles.numPot}>{player.potential}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-start' }}>
                <View style={[styles.progPill, showPotential && styles.progPillActive]}>
                  <Text style={[styles.progPillText, showPotential && styles.progPillTextActive]}>
                    {showPotential ? '🚀 במלוא הפוטנציאל' : `+${player.growth} צמיחה בקריירה`}
                  </Text>
                </View>
                <Text style={styles.progRoleSub}>מעמד: {player.squadRole}</Text>
              </View>
            </View>

            {/* PROGRESS TRACK */}
            <View style={styles.progTrack}>
              <View
                style={[
                  styles.progBarGlow,
                  showPotential && styles.progBarGlowFull,
                  {
                    width: showPotential
                      ? '100%'
                      : `${Math.min(100, Math.round((player.rating / player.potential) * 100))}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.progFootRow}>
              <Text style={styles.progFootText}>
                {showPotential ? `רייטינג מוצג: ${player.potential} (שיא)` : `רייטינג נוכחי: ${player.rating}`}
              </Text>
              <Text style={styles.progFootText}>פוטנציאל שיא: {player.potential}</Text>
            </View>
          </View>

          {/* FINANCES 2x2 */}
          <View style={styles.finGrid2x2}>
            <View style={styles.finTile}>
              <Text style={styles.finLabel}>שווי שוק מוערך</Text>
              <Text style={[styles.finVal, { color: '#38bdf8' }]}>
                {formatEurFull(player.marketValueEur)}
              </Text>
            </View>
            <View style={styles.finTile}>
              <Text style={styles.finLabel}>שכר שבועי מבוקש</Text>
              <Text style={styles.finVal}>
                {formatEurFull(player.weeklyWageEur)} / שבוע
              </Text>
            </View>
            <View style={styles.finTile}>
              <Text style={styles.finLabel}>סעיף שחרור בחוזה</Text>
              <Text style={[styles.finVal, { color: '#f59e0b' }]}>
                {formatEurFull(player.releaseClauseEur)}
              </Text>
            </View>
            <View style={styles.finTile}>
              <Text style={styles.finLabel}>אורך חוזה קיים</Text>
              <Text style={styles.finVal}>{player.contractYears}</Text>
            </View>
          </View>

          {/* TACTICAL ROLES FC 27 */}
          <View style={styles.sectionCard}>
            <View style={styles.secTopLine}>
              <Text style={styles.secMainLabel}>תפקידים טקטיים (FC 27 Player Roles)</Text>
              <Text style={styles.secSystemTag}>{player.roleSystem}</Text>
            </View>
            <View style={styles.rolesRow}>
              <View style={[styles.roleBlock, styles.starRoleBlock]}>
                <Text style={styles.starRoleText} numberOfLines={1}>
                  {player.primaryRole}
                </Text>
              </View>
              <View style={styles.roleBlock}>
                <Text style={styles.normalRoleText} numberOfLines={1}>
                  {player.secondaryRole}
                </Text>
              </View>
            </View>
          </View>

          {/* PLAYSTYLES */}
          <View style={styles.sectionCard}>
            <View style={styles.secTopLine}>
              <Text style={styles.secMainLabel}>סגנונות משחק (PlayStyles)</Text>
              <Text style={styles.goldPlayStyleHint}>סגנון מוזהב +</Text>
            </View>
            <View style={styles.psWrap}>
              {player.playstyles.map((ps, i) => (
                <View
                  key={i}
                  style={[styles.playstyleTag, ps.plus && styles.playstyleTagGold]}
                >
                  <Text
                    style={[
                      styles.playstyleTagText,
                      ps.plus && styles.playstyleTagGoldText,
                    ]}
                  >
                    {ps.plus ? '★ ' : ''}
                    {ps.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ATTRIBUTES ACCORDION / TOGGLE */}
          <View style={[styles.sectionCard, showPotential && styles.sectionCardPotential]}>
            <View style={styles.secTopLine}>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={styles.secMainLabel}>
                  {showPotential ? '🚀 נתונים בשיא הפוטנציאל' : '📊 נתוני יכולת מלאים'}
                </Text>
                <Text style={styles.statsSubtitle}>
                  {showPotential
                    ? `רייטינג שיא: ${player.potential} (+${player.growth})`
                    : `רייטינג נוכחי: ${player.rating}`}
                </Text>
              </View>

              {/* POTENTIAL TOGGLE BUTTON */}
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPotential((prev) => !prev)}
                style={[
                  styles.potentialToggleBtn,
                  showPotential && styles.potentialToggleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.potentialToggleText,
                    showPotential && styles.potentialToggleTextActive,
                  ]}
                >
                  {showPotential ? '✔ מלוא הפוטנציאל' : '⚡ ראה מלוא הפוטנציאל'}
                </Text>
              </Pressable>
            </View>

            {/* FACE 6 OVERVIEW */}
            <View style={styles.statMatrix}>
              <StatItem
                label={attrBundle?.isGk ? 'זינוק (DIV)' : 'מהירות (PAC)'}
                value={currentFace.pac}
                diff={showPotential ? currentFace.pac - player.attributes.pac : undefined}
              />
              <StatItem
                label={attrBundle?.isGk ? 'תפיסה (HAN)' : 'סיומת (SHO)'}
                value={currentFace.sho}
                diff={showPotential ? currentFace.sho - player.attributes.sho : undefined}
              />
              <StatItem
                label={attrBundle?.isGk ? 'בעיטה (KIC)' : 'מסירה (PAS)'}
                value={currentFace.pas}
                diff={showPotential ? currentFace.pas - player.attributes.pas : undefined}
              />
              <StatItem
                label={attrBundle?.isGk ? 'רפלקסים (REF)' : 'כדרור (DRI)'}
                value={currentFace.dri}
                diff={showPotential ? currentFace.dri - player.attributes.dri : undefined}
              />
              <StatItem
                label={attrBundle?.isGk ? 'מהירות (SPD)' : 'הגנה (DEF)'}
                value={currentFace.def}
                diff={showPotential ? currentFace.def - player.attributes.def : undefined}
              />
              <StatItem
                label={attrBundle?.isGk ? 'מיקום (POS)' : 'פיזיות (PHY)'}
                value={currentFace.phy}
                diff={showPotential ? currentFace.phy - player.attributes.phy : undefined}
              />
            </View>

            {/* FULL DETAILED IN-GAME ATTRIBUTES BREAKDOWN */}
            <View style={styles.detailedGroupsWrap}>
              <View style={styles.detailedDividerRow}>
                <View style={styles.detailedDividerLine} />
                <Text style={styles.detailedDividerLabel}>
                  פירוט מלא של כל התכונות (In-Game Detailed Stats)
                </Text>
                <View style={styles.detailedDividerLine} />
              </View>

              <View style={styles.detailedGroupsGrid}>
                {detailedGroups.map((group) => (
                  <View key={group.label} style={styles.detailedGroupCard}>
                    <View style={styles.detailedGroupHeader}>
                      <Text style={styles.detailedGroupTitle}>{group.hebrewLabel}</Text>
                      <Text style={[styles.detailedGroupTotal, { color: statTone(group.total) }]}>
                        {group.total}
                      </Text>
                    </View>

                    {/* STAT BAR */}
                    <View style={styles.detailedProgressBarBg}>
                      <View
                        style={[
                          styles.detailedProgressBarFill,
                          {
                            width: `${Math.min(100, group.total)}%`,
                            backgroundColor: statTone(group.total),
                          },
                        ]}
                      />
                    </View>

                    {/* INDIVIDUAL SUB-STATS */}
                    <View style={styles.subStatsList}>
                      {group.stats.map((item) => (
                        <View key={item.key} style={styles.subStatRow}>
                          <Text style={styles.subStatLabel} numberOfLines={1}>
                            {item.hebrewLabel}
                          </Text>
                          <View style={styles.subStatValueWrap}>
                            {item.diff && item.diff > 0 ? (
                              <Text style={styles.subStatDiff}>+{item.diff}</Text>
                            ) : null}
                            <Text
                              style={[
                                styles.subStatValue,
                                { color: statTone(item.value) },
                              ]}
                            >
                              {item.value}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* BOTTOM RETURN BUTTON */}
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.modalBottomCloseBtn}
          >
            <Text style={styles.modalBottomCloseBtnText}>‹ חזרה לרשימת השחקנים</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

function StatItem({
  label,
  value,
  diff,
}: {
  label: string;
  value: number;
  diff?: number;
}) {
  const isHigh = value >= 80;
  return (
    <View style={styles.statBox}>
      <Text style={styles.statTitle}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 3, marginTop: 1 }}>
        {diff && diff > 0 ? (
          <Text style={styles.statDiffBadge}>+{diff}</Text>
        ) : null}
        <Text
          style={[
            styles.statNumber,
            isHigh ? styles.statNumberHigh : undefined,
            diff && diff > 0 ? styles.statNumberBoosted : undefined,
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  backBtnText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: '700',
  },
  careerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 255, 140, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 140, 0.45)',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff8c',
  },
  careerBadgeText: {
    color: '#00ff8c',
    fontSize: 11,
    fontWeight: '900',
  },
  titleBlock: {
    gap: 3,
  },
  mainTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subTitle: {
    fontSize: 11.5,
    color: '#cbd5e1',
    fontWeight: '600',
    textAlign: 'right',
  },
  filterBar: {
    flexGrow: 0,
    marginVertical: 4,
  },
  filterScroll: {
    flexDirection: 'row-reverse',
    gap: 7,
    paddingVertical: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  filterPillActive: {
    backgroundColor: '#00ff8c',
    borderColor: '#55ffb0',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94a3b8',
  },
  filterPillTextActive: {
    color: '#022010',
    fontWeight: '900',
  },
  israelFilterPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  israelFilterPillActive: {
    backgroundColor: '#38bdf8',
    borderColor: '#7dd3fc',
  },
  israelFilterText: {
    color: '#7dd3fc',
  },
  israelFilterTextActive: {
    color: '#031726',
    fontWeight: '900',
  },
  subFilterBar: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  subFilterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  subFilterBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderColor: '#ffffff',
  },
  subFilterBtn7077: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  subFilterBtn7077Active: {
    backgroundColor: '#d97706',
    borderColor: '#f59e0b',
  },
  subFilterBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  subFilterBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  subFilterBtn7077Text: {
    color: '#fbbf24',
  },
  subFilterBtn7077TextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  cardsList: {
    gap: 10,
  },
  cardItem: {
    position: 'relative',
    borderRadius: 16,
    backgroundColor: 'rgba(14, 24, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    padding: 10,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardItemIsrael: {
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 4,
  },
  cutoutBox: {
    width: 76,
    height: 96,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 38, 56, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  portraitImg: {
    width: 84,
    height: 94,
  },
  portraitPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
  },
  posBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  posBadgeText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900',
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',
  },
  growthPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 255, 140, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 140, 0.45)',
  },
  growthPillText: {
    color: '#00ff8c',
    fontSize: 10,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
  },
  clubCrest: {
    width: 14,
    height: 14,
  },
  nationFlag: {
    width: 15,
    height: 10,
    borderRadius: 2,
  },
  metaText: {
    fontSize: 10.5,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 9,
    color: '#64748b',
  },
  ratingStrip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(8, 14, 22, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ratingPair: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 5,
  },
  curOvr: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#ffffff',
  },
  arrowIcon: {
    fontSize: 11,
    color: '#00ff8c',
    fontWeight: '900',
  },
  maxPot: {
    fontSize: 15.5,
    fontWeight: '900',
    color: '#00ff8c',
  },
  roleChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    maxWidth: '55%',
  },
  roleChipText: {
    color: '#7dd3fc',
    fontSize: 9,
    fontWeight: '800',
  },
  valueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 1,
  },
  valueGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 4,
  },
  euroVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#38bdf8',
  },
  wageVal: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
  },
  reportBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reportBtnText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  advisorStrip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderRadius: 13,
    backgroundColor: 'rgba(14, 24, 38, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 140, 0.35)',
    marginTop: 6,
  },
  advisorEmoji: {
    fontSize: 18,
  },
  advisorText: {
    fontSize: 10.5,
    color: '#e2e8f0',
    lineHeight: 16,
    textAlign: 'right',
  },
  advisorHighlight: {
    color: '#00ff8c',
    fontWeight: '900',
  },

  /* PAGINATION STYLES */
  pageSummaryStrip: {
    flexDirection: 'row',
    direction: 'rtl',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    width: '100%',
  },
  pageSummaryInfo: {
    gap: 2,
    flexShrink: 1,
    minWidth: 130,
  },
  pageSummaryTotal: {
    color: '#e2e8f0',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'right',
  },
  pageSummaryNum: {
    color: '#00ff8c',
    fontWeight: '900',
  },
  pageSummaryPage: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  quickNavArrows: {
    flexDirection: 'row',
    direction: 'rtl',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  quickNavBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  quickNavBtnDisabled: {
    opacity: 0.35,
  },
  quickNavBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  quickNavBtnTextDisabled: {
    color: '#64748b',
  },
  quickNavPageBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 255, 140, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 140, 0.3)',
  },
  quickNavPageBadgeText: {
    color: '#00ff8c',
    fontSize: 11,
    fontWeight: '900',
  },
  bottomPagerBox: {
    marginTop: 10,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 16, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 12,
    alignItems: 'center',
  },
  bottomPagerControls: {
    width: '100%',
    flexDirection: 'row',
    direction: 'rtl',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pagerNavBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pagerNavBtnDisabled: {
    opacity: 0.35,
  },
  pagerNavBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  pagerNavBtnTextDisabled: {
    color: '#64748b',
  },
  pagerStatusLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '800',
  },
  pagerChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageNumberChip: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pageNumberChipActive: {
    backgroundColor: '#00ff8c',
    borderColor: '#00ff8c',
  },
  pageNumberChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  pageNumberChipTextActive: {
    color: '#03120a',
    fontWeight: '900',
  },
  modalBottomCloseBtn: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBottomCloseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  /* MODAL STYLES */
  modalBackdrop: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: 'rgba(5, 8, 14, 0.88)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: '#090e17',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 24 : 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalScrollContent: {
    paddingBottom: 160,
    gap: 10,
  },
  profileHeroCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(14, 24, 38, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    flexDirection: 'row-reverse',
    gap: 12,
    alignItems: 'center',
  },
  profileHeroCardIsrael: {
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },
  heroAvatarBox: {
    width: 86,
    height: 110,
    borderRadius: 12,
    backgroundColor: 'rgba(24, 38, 56, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroAvatarImg: {
    width: 94,
    height: 106,
  },
  heroMetaCol: {
    flex: 1,
    gap: 3,
  },
  heroPlayerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',
  },
  heroEnTitle: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'right',
  },
  chipsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 5,
  },
  infoChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoChipText: {
    color: '#e2e8f0',
    fontSize: 9.5,
    fontWeight: '700',
  },
  progPanel: {
    borderRadius: 15,
    backgroundColor: 'rgba(6, 78, 59, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 140, 0.45)',
    padding: 11,
    gap: 6,
  },
  progPanelPotential: {
    backgroundColor: 'rgba(12, 74, 110, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.65)',
  },
  progPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38bdf8',
  },
  progPillTextActive: {
    color: '#38bdf8',
  },
  progBarGlowFull: {
    backgroundColor: '#38bdf8',
  },
  progHead: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progHeadTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#a7f3d0',
    textAlign: 'right',
  },
  progNumbers: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 6,
  },
  numCur: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  numArrow: {
    fontSize: 13,
    color: '#00ff8c',
    fontWeight: '900',
  },
  numPot: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00ff8c',
  },
  progPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 255, 140, 0.2)',
    borderWidth: 1,
    borderColor: '#00ff8c',
  },
  progPillText: {
    color: '#00ff8c',
    fontSize: 10.5,
    fontWeight: '900',
  },
  progRoleSub: {
    fontSize: 9,
    color: '#cbd5e1',
    fontWeight: '700',
    marginTop: 3,
  },
  progTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progBarGlow: {
    height: '100%',
    backgroundColor: '#00ff8c',
    borderRadius: 4,
  },
  progFootRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  progFootText: {
    fontSize: 9,
    color: '#cbd5e1',
    fontWeight: '700',
  },
  finGrid2x2: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 7,
  },
  finTile: {
    width: '48.5%',
    borderRadius: 11,
    backgroundColor: 'rgba(14, 24, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: 8,
    gap: 2,
  },
  finLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'right',
  },
  finVal: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',
  },
  sectionCard: {
    borderRadius: 13,
    backgroundColor: 'rgba(14, 24, 38, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    padding: 10,
    gap: 8,
  },
  secTopLine: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secMainLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#e2e8f0',
    textAlign: 'right',
  },
  secSystemTag: {
    fontSize: 9.5,
    color: '#38bdf8',
    fontWeight: '800',
  },
  rolesRow: {
    flexDirection: 'row-reverse',
    gap: 7,
  },
  roleBlock: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  starRoleBlock: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.45)',
  },
  starRoleText: {
    color: '#7dd3fc',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  normalRoleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  goldPlayStyleHint: {
    fontSize: 9.5,
    color: '#f59e0b',
    fontWeight: '800',
  },
  psWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 5,
  },
  playstyleTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  playstyleTagGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
  },
  playstyleTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  playstyleTagGoldText: {
    color: '#fef3c7',
    fontWeight: '800',
  },
  statsSubtitle: {
    fontSize: 9.5,
    color: '#94a3b8',
    fontWeight: '700',
  },
  statMatrix: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  statBox: {
    width: '31.5%',
    borderRadius: 8,
    backgroundColor: 'rgba(8, 14, 22, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 8.5,
    color: '#94a3b8',
    fontWeight: '700',
  },
  statNumber: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 1,
  },
  statNumberHigh: {
    color: '#00ff8c',
  },
  statNumberBoosted: {
    color: '#38bdf8',
  },
  statDiffBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#38bdf8',
  },
  sectionCardPotential: {
    borderColor: 'rgba(56, 189, 248, 0.45)',
    backgroundColor: 'rgba(10, 25, 45, 0.85)',
  },
  potentialToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  potentialToggleBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  potentialToggleText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  potentialToggleTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  detailedGroupsWrap: {
    marginTop: 10,
    gap: 10,
  },
  detailedDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  detailedDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  detailedDividerLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#cbd5e1',
  },
  detailedGroupsGrid: {
    gap: 8,
  },
  detailedGroupCard: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 9,
    gap: 6,
  },
  detailedGroupHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailedGroupTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
  detailedGroupTotal: {
    fontSize: 15,
    fontWeight: '900',
  },
  detailedProgressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  detailedProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  subStatsList: {
    gap: 3,
    marginTop: 2,
  },
  subStatRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  subStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  subStatValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  subStatDiff: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38bdf8',
  },
  subStatValue: {
    fontSize: 12,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'left',
  },
});
