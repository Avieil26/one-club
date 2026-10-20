import audit from '@/assets/data/sbc-audit-20261020.json';
import type { SbcChallenge } from '@/lib/types';

export const SBC_AUDIT_CHECKED_AT = audit.checkedAt;
export const ARCHIVED_SBC_IDS = new Set(audit.retiredIds);
export const LIVE_SBC_TRANSLATIONS: Record<string, string> = Object.fromEntries(audit.challenges.map((c) => [c.requirements, c.requirementsEn]));
export const LIVE_SBC_CHALLENGES: SbcChallenge[] = audit.challenges.map(({ requirementsEn: _english, ...challenge }) => ({ ...challenge, kind: challenge.kind as SbcChallenge['kind'], rules: challenge.rules as SbcChallenge['rules'] }));
