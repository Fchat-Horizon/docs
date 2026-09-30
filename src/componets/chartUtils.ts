import type { Platform } from '../data/stats';

export const PLATFORMS: { key: Platform; label: string }[] = [
  { key: 'windows', label: 'Windows' },
  { key: 'linux', label: 'Linux' },
  { key: 'mac', label: 'macOS' },
];

const numberFormat = new Intl.NumberFormat('en-US');
const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatNumber = (n: number) => numberFormat.format(Math.round(n));
const dateTimeFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) =>
  dateTimeFormat.format(new Date(iso));

export function formatDays(days: number): string {
  if (days < 1) return 'less than a day';
  const rounded = Math.round(days);
  return `${rounded} day${rounded === 1 ? '' : 's'}`;
}
