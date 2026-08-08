/** URL-safe base64 of UTF-8. No dependency, no server. */
export const encodeAssignment = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i] as number);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeAssignment = (s: string): string | null => {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch { return null; }
};

export const readAssignmentFromHash = (hash: string): string | null => {
  const m = /[#&]a=([^&]+)/.exec(hash);
  return m && m[1] ? decodeAssignment(m[1]) : null;
};

export const shareUrl = (origin: string, path: string, assignment: string): string =>
  `${origin}${path}#a=${encodeAssignment(assignment)}`;
