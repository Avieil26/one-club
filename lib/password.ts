const SALT = 'fc27-israel-account-v1';

export async function hashPassword(password: string): Promise<string> {
  const material = `${SALT}:${password}`;
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const digest = await subtle.digest('SHA-256', new TextEncoder().encode(material));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  let left = 0x811c9dc5;
  let right = 0x01000193;
  for (let index = 0; index < material.length; index += 1) {
    const code = material.charCodeAt(index);
    left = Math.imul(left ^ code, 0x01000193);
    right = Math.imul(right ^ code, 0x85ebca6b);
  }
  return `${(left >>> 0).toString(16)}${(right >>> 0).toString(16)}`;
}
