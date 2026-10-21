/** Only browsing routes are public. Mutations, inboxes and account pages require auth. */
const publicPages = new Set(['/', '/index', '/career', '/ultimate', '/champions', '/grounds', '/sbc', '/sbc/calculator', '/market', '/board', '/games', '/settings']);
export function isPublicPath(path: string): boolean {
  if (publicPages.has(path)) return true;
  if (/^\/sbc\/solution\/[a-zA-Z0-9_-]+$/.test(path)) return true;
  if (/^\/(games)\/(club|draft|grid|who)$/.test(path)) return true;
  const detail = path.match(/^\/(career|ultimate|market|sbc|player)\/([a-zA-Z0-9_-]+)$/);
  return Boolean(detail && !['new', 'journeys', 'build', 'submit', 'upload'].includes(detail[2]));
}
