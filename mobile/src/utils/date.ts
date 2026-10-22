/**
 * Formats a Date object or ISO string into a human-readable representation:
 * e.g., "Oct 24, 2:30 PM"
 */
export function formatDateTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12

  return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Returns a human-friendly relative deadline status:
 * e.g. "Overdue by 2h", "Due in 45m", "Due in 3d", "Due tomorrow at 5 PM"
 */
export function getDeadlineRelativeStatus(deadlineInput: Date | string, isCompleted = false): {
  text: string;
  isOverdue: boolean;
  isSoon: boolean; // < 24 hours
} {
  if (isCompleted) {
    return { text: 'Completed', isOverdue: false, isSoon: false };
  }

  const now = Date.now();
  const deadline = new Date(deadlineInput).getTime();
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    // Overdue
    const absHours = Math.abs(diffHours);
    if (absHours < 1) {
      const minutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
      return { text: `Overdue by ${minutes}m`, isOverdue: true, isSoon: false };
    }
    if (absHours < 24) {
      return { text: `Overdue by ${Math.floor(absHours)}h`, isOverdue: true, isSoon: false };
    }
    const days = Math.floor(absHours / 24);
    return { text: `Overdue by ${days}d`, isOverdue: true, isSoon: false };
  }

  // Not overdue yet
  if (diffHours < 1) {
    const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return { text: `Due in ${minutes}m`, isOverdue: false, isSoon: true };
  }
  if (diffHours < 24) {
    return { text: `Due in ${Math.floor(diffHours)}h`, isOverdue: false, isSoon: true };
  }
  const days = Math.floor(diffHours / 24);
  if (days === 1) {
    return { text: 'Due tomorrow', isOverdue: false, isSoon: true };
  }
  return { text: `Due in ${days} days`, isOverdue: false, isSoon: false };
}
