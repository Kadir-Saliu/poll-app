export function calculateEndsIn(endDate: string | null): string {
  if (!endDate) return ''; // oder 'Ongoing'
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return '';
  if (diff === 0) return 'Ends today';
  return ` ${diff} days`;
}
