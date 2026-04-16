import { v4 as uuidv4 } from 'uuid';

export const generateId = () => uuidv4();

export const AVATAR_COLORS = [
  '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#10b981',
  '#3b82f6', '#f59e0b', '#ef4444', '#14b8a6', '#a855f7',
  '#6366f1', '#d946ef', '#0ea5e9', '#22c55e', '#eab308',
];

export function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = (now - date) / (1000 * 60 * 60 * 24);

  if (diff < 1) {
    const hours = Math.floor((now - date) / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.floor((now - date) / (1000 * 60));
      return mins <= 1 ? 'Just now' : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (diff < 2) return 'Yesterday';
  if (diff < 7) return `${Math.floor(diff)}d ago`;
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}
