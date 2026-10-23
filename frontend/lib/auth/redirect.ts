/** Only same-site relative paths: blocks open redirects like ?next=//evil.com or https://evil.com. */
export function safeRedirectPath(value: unknown, fallback = '/'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
