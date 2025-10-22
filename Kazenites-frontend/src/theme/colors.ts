// Centralized color palette for the Kazenites app (Blackberry-inspired)
// Deep blackberry purples, soft lilac neutrals, and leaf-green accents

export const Colors = {
  // Brand
  primary: '#5C209C', // rich blackberry purple (matches existing launcher tone)
  primaryDark: '#4A1A7D',
  primaryLight: '#7A33C4',

  // Surfaces
  background: '#0B0911', // near-black plum
  surface: '#151122', // cards and panels
  surfaceAlt: '#1C162B', // elevated blocks, tab bars
  surfaceMuted: '#1A1326', // inputs and chips

  // Content
  text: '#FFFFFF',
  textMuted: '#C7B8DA', // lilac gray
  textSubtle: '#D8CCEA',

  // Borders & outlines
  border: '#2A1F3D',
  outline: '#3B294E',

  // States
  success: '#22C55E',
  successMuted: '#BFEBD1',
  warning: '#F59E0B',
  error: '#EF4444',

  // Other
  overlay: 'rgba(0,0,0,0.6)',
  placeholder: '#BFAFDC',
};

export type AppColors = typeof Colors;
