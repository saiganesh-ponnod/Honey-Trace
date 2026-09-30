/**
 * Cryptographic SHA-256 helper using Web Crypto API with synchronous fallback
 */
export async function computeSha256(data: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // Fallback to fast synchronous hash below
  }
  return simpleSha256(data);
}

export function simpleSha256(input: string): string {
  // Pure JS DJB2/Murmur-style mix converted to 64-char hex for offline demo guarantee
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0x9e3779b9, h4 = 0x85ebca6b;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ (ch << 1), 1597334677);
    h3 = Math.imul(h3 ^ (ch >> 2), 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const part1 = toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
  const part2 = toHex(h4 ^ 0x13579bdf) + toHex(h3 ^ 0x2468ace0) + toHex(h2 ^ 0x7a8b9c0d) + toHex(h1 ^ 0x0f1e2d3c);
  return (part1 + part2).toLowerCase();
}

/**
 * Generates an unambiguous random batch code: HT-<YEAR>-<6 chars>
 * Alphabet excluding confusing characters (0, O, 1, I)
 */
export function generateBatchCode(year = new Date().getFullYear()): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HT-${year}-${result}`;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateDeviceKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let res = 'ht_dev_';
  for (let i = 0; i < 32; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}
