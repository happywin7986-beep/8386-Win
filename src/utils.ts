/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Custom seed-based encoding/decryption to secure the premium tattoo prompts at-rest and in-transit.
// This prevents scrapers/inspectors from copy pasting active prompts via developer tools or raw Firestore lists.
export function maskPrompt(text: string): string {
  if (!text) return '';
  try {
    const encoded = encodeURIComponent(text);
    const b64 = btoa(unescapedSafe(encoded));
    return b64.split('').map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + 3);
    }).join('');
  } catch (e) {
    return text;
  }
}

export function unmaskPrompt(masked: string): string {
  if (!masked) return '';
  // If it doesn't look like our custom masked format, return as-is
  try {
    const originalB64 = masked.split('').map((char) => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code - 3);
    }).join('');
    const decoded = escapedSafe(atob(originalB64));
    return decodeURIComponent(decoded);
  } catch (e) {
    return masked; // Fallback
  }
}

// Helpers for unicode safe Base64
function unescapedSafe(str: string): string {
  return unescape(str);
}

function escapedSafe(str: string): string {
  return escape(str);
}
