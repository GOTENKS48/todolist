/**
 * Modern Dark Neo-Glass Theme Tokens
 * Provides a futuristic, polished aesthetic with vibrant neon highlights.
 */
export const Colors = {
  // Backgrounds
  bgPrimary: '#0A0E1A',
  bgSecondary: '#121829',
  bgCard: '#172036',
  bgCardHover: '#1E2945',
  bgInput: '#0E1424',
  bgGlass: 'rgba(23, 32, 54, 0.75)',
  bgOverlay: 'rgba(5, 8, 16, 0.75)',

  // Brand Accents
  primary: '#6366F1', // Electric Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',

  secondary: '#06B6D4', // Cyan
  secondaryGlow: 'rgba(6, 182, 212, 0.25)',

  accent: '#8B5CF6', // Purple
  accentPink: '#EC4899',

  // Status & Priority Colors
  success: '#10B981', // Emerald
  successGlow: 'rgba(16, 185, 129, 0.2)',

  warning: '#F59E0B', // Amber
  warningGlow: 'rgba(245, 158, 11, 0.2)',

  danger: '#EF4444', // Red
  dangerGlow: 'rgba(239, 68, 68, 0.25)',

  info: '#3B82F6', // Blue

  // Priority specifics
  priorityUrgent: '#EF4444',
  priorityUrgentBg: 'rgba(239, 68, 68, 0.15)',

  priorityHigh: '#F97316',
  priorityHighBg: 'rgba(249, 115, 22, 0.15)',

  priorityMedium: '#F59E0B',
  priorityMediumBg: 'rgba(245, 158, 11, 0.15)',

  priorityLow: '#3B82F6',
  priorityLowBg: 'rgba(59, 130, 246, 0.15)',

  // Categories
  categoryWork: '#6366F1',
  categoryPersonal: '#EC4899',
  categoryStudy: '#8B5CF6',
  categoryUrgent: '#EF4444',
  categoryHealth: '#10B981',
  categoryFinance: '#14B8A6',
  categoryOther: '#94A3B8',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDark: '#0F172A',

  // Borders
  border: '#232E48',
  borderLight: '#334155',
  borderFocus: '#6366F1',

  // Shadows / Highlights
  white: '#FFFFFF',
  black: '#000000',
};

export const CategoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  WORK: { bg: 'rgba(99, 102, 241, 0.15)', text: '#A5B4FC', dot: '#6366F1' },
  PERSONAL: { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', dot: '#EC4899' },
  STUDY: { bg: 'rgba(139, 92, 246, 0.15)', text: '#C4B5FD', dot: '#8B5CF6' },
  URGENT: { bg: 'rgba(239, 68, 68, 0.15)', text: '#FCA5A5', dot: '#EF4444' },
  HEALTH: { bg: 'rgba(16, 185, 129, 0.15)', text: '#6EE7B7', dot: '#10B981' },
  FINANCE: { bg: 'rgba(20, 184, 166, 0.15)', text: '#5EEAD4', dot: '#14B8A6' },
  OTHER: { bg: 'rgba(148, 163, 184, 0.15)', text: '#CBD5E1', dot: '#94A3B8' },
};
