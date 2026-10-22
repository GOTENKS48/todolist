/**
 * Aesthetic Warm Cream & Caramel Pastel Theme
 * Inspired by modern minimal aesthetic note/to-do design with warm butter-cream paper,
 * honey caramel highlights, soft slate blue accents, and deep warm espresso typography.
 */
export const Colors = {
  // Backgrounds
  bgPrimary: '#FBF6EE', // Warm butter-cream paper canvas
  bgSecondary: '#F5ECE0', // Soft linen container
  bgCard: '#FFFDF9', // Aesthetic warm milk-white card
  bgCardHover: '#F7F0E3',
  bgInput: '#F5EEE3',
  bgGlass: 'rgba(255, 253, 249, 0.92)',
  bgOverlay: 'rgba(43, 37, 33, 0.55)',

  // Brand Accents
  primary: '#C59158', // Warm Honey Caramel (from reference image)
  primaryLight: '#D9A873',
  primaryDark: '#AB7842',
  primaryGlow: 'rgba(197, 145, 88, 0.22)',

  secondary: '#8FA4BE', // Soft pastel slate/periwinkle blue
  secondaryGlow: 'rgba(143, 164, 190, 0.25)',

  accent: '#9BB2C9', // Gentle muted sky blue
  accentPink: '#DF9B8C', // Warm terracotta blush

  // Status & Priority Colors
  success: '#5B8A61', // Soft sage green
  successGlow: 'rgba(91, 138, 97, 0.18)',

  warning: '#D68C45', // Warm amber
  warningGlow: 'rgba(214, 140, 69, 0.2)',

  danger: '#C85A48', // Warm terracotta coral
  dangerGlow: 'rgba(200, 90, 72, 0.22)',

  info: '#7D95B3', // Muted slate blue

  // Priority specifics
  priorityUrgent: '#C85A48',
  priorityUrgentBg: 'rgba(200, 90, 72, 0.12)',

  priorityHigh: '#D68C45',
  priorityHighBg: 'rgba(214, 140, 69, 0.12)',

  priorityMedium: '#C59158',
  priorityMediumBg: 'rgba(197, 145, 88, 0.12)',

  priorityLow: '#8FA4BE',
  priorityLowBg: 'rgba(143, 164, 190, 0.12)',

  // Categories
  categoryWork: '#C59158',
  categoryPersonal: '#DF9B8C',
  categoryStudy: '#8FA4BE',
  categoryUrgent: '#C85A48',
  categoryHealth: '#5B8A61',
  categoryFinance: '#6B9080',
  categoryOther: '#9B9085',

  // Typography
  textPrimary: '#2B2521', // Deep warm charcoal espresso
  textSecondary: '#665C54', // Medium warm taupe
  textMuted: '#9E9287', // Soft muted caption
  textDark: '#1E1916',

  // Borders
  border: '#EDE4D5', // Soft delicate warm border
  borderLight: '#F3EBDD',
  borderFocus: '#C59158',

  // Shadows / Highlights
  white: '#FFFFFF',
  black: '#000000',
};

export const CategoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  WORK: { bg: 'rgba(197, 145, 88, 0.12)', text: '#9B6C38', dot: '#C59158' },
  PERSONAL: { bg: 'rgba(223, 155, 140, 0.14)', text: '#B55E4C', dot: '#DF9B8C' },
  STUDY: { bg: 'rgba(143, 164, 190, 0.15)', text: '#5D7799', dot: '#8FA4BE' },
  URGENT: { bg: 'rgba(200, 90, 72, 0.14)', text: '#A84131', dot: '#C85A48' },
  HEALTH: { bg: 'rgba(91, 138, 97, 0.14)', text: '#436B48', dot: '#5B8A61' },
  FINANCE: { bg: 'rgba(107, 144, 128, 0.14)', text: '#4A7061', dot: '#6B9080' },
  OTHER: { bg: 'rgba(155, 144, 133, 0.14)', text: '#786E64', dot: '#9B9085' },
};
