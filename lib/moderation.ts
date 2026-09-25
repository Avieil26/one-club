const BLOCKED = [
  'מטומטם',
  'מטומטמת',
  'אידיוט',
  'דביל',
  'מפגר',
  'זין',
  'כוסאמק',
  'כוסעמק',
  'זונה',
  'בן זונה',
  'בת זונה',
  'חרא',
  'מניאק',
  'קוקסינל',
  'fuck',
  'shit',
  'bitch',
  'asshole',
];

export function isBlockedText(body: string): boolean {
  const lowered = body.trim().toLowerCase();
  if (!lowered) return false;
  return BLOCKED.some((word) => lowered.includes(word));
}

export function commentVisibility(body: string): 'visible' | 'hidden_pending' {
  return isBlockedText(body) ? 'hidden_pending' : 'visible';
}
