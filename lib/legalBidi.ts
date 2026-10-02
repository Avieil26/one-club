/** Latin, email, and address runs. The @ stays inside the run so RTL cannot move ".com" to the start. */
export const LATIN_RUN =
  /[A-Za-z0-9](?:[A-Za-z0-9@]|[.&+\-/'’:\/_#](?=[A-Za-z0-9])| ?[/&] ?(?=[A-Za-z0-9])| (?=[A-Za-z0-9]))*/g;

export function inlineLatin(text: string) {
  return text.replace(LATIN_RUN, (run) => `\u2066${run}\u2069\u200F`);
}

export function latinParts(text: string): { latin: boolean; value: string }[] {
  const parts: { latin: boolean; value: string }[] = [];
  let cursor = 0;
  for (const match of text.matchAll(LATIN_RUN)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ latin: false, value: text.slice(cursor, index) });
    parts.push({ latin: true, value: match[0] });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) parts.push({ latin: false, value: text.slice(cursor) });
  return parts;
}
