/**
 * A native alternative to date-fns' formatDistanceToNow
 * 
 * @param {Date|number|string} date 
 * @returns {string} 
 */
export function formatDistanceToNowNative(date) {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const units = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
  ];

  for (const { unit, seconds } of units) {
    if (diffInSeconds >= seconds) {
      const count = Math.floor(diffInSeconds / seconds);
      return rtf.format(-count, unit);
    }
  }

  return 'some time ago';
}
