import current from '@/assets/data/sbc-refresh-20261028.json';
import bellerin from '@/assets/data/sbc-bellerin-20261028.json';
import latest from '@/assets/data/sbc-refresh-20261026.json';
import refresh from '@/assets/data/sbc-refresh-20261025.json';
import audit from '@/assets/data/sbc-audit-20261020.json';
import type { SbcChallenge } from '@/lib/types';

export const SBC_AUDIT_CHECKED_AT = current.checkedAt;
export const ARCHIVED_SBC_IDS = new Set(audit.retiredIds);
export const LIVE_SBC_TRANSLATIONS: Record<string, string> = Object.fromEntries([...audit.challenges, ...refresh.challenges, ...latest.challenges, ...bellerin.challenges, ...current.challenges].map((c) => [c.requirements, c.requirementsEn]));
export const LIVE_SBC_CHALLENGES: SbcChallenge[] = [...audit.challenges, ...refresh.challenges, ...latest.challenges, ...bellerin.challenges, ...current.challenges].map(({ requirementsEn: _english, ...challenge }) => ({ ...challenge, kind: challenge.kind as SbcChallenge['kind'], rules: challenge.rules as SbcChallenge['rules'] }));
