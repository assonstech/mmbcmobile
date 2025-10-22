// src/utils/timeHelper.js
import { formatDistanceToNow, parseISO } from 'date-fns';

export const timeAgo = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true }); // e.g., "2 hours ago"
};
