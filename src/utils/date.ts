export function formatDate(date: string | undefined): string {
  if (!date) {
    return 'No due date';
  }
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'No due date';
  }

  return parsed.toLocaleDateString(undefined, options);
}

export function daysUntil(date: string | undefined): number | null {
  if (!date) {
    return null;
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const now = new Date();
  const diff = parsed.getTime() - now.setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
