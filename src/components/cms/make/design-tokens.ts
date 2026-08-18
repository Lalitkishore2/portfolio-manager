export const tokens = {
  // Authentic Figma Make Color System
  color: {
    bg: {
      app:       '#1E1E1E',   // Figma dark chrome background
      surface:   '#2C2C2C',   // Panel surfaces & card backgrounds
      surfaceHover: '#383838', // Card hover state
      canvas:    '#141414',   // Deep dark canvas workspace
      toolbar:   '#1E1E1E',   // Top header bar
      floatingBar:'#1E1E1E',  // Bottom floating command bar
      statusBar: '#181818',   // Minimal bottom status bar
      hover:     'rgba(255, 255, 255, 0.06)',
      active:    'rgba(13, 153, 255, 0.15)',
      activeBlue:'rgba(13, 153, 255, 0.25)',
    },
    border: {
      default:   'rgba(255, 255, 255, 0.08)',
      subtle:    'rgba(255, 255, 255, 0.04)',
      focus:     '#0D99FF',   // Figma Blue (brand)
      ai:        '#8A3FFC',   // Figma AI Purple
      aiGradient:'linear-gradient(135deg, #8A3FFC, #D946EF, #0D99FF)',
      success:   '#10B981',   // Emerald
      warning:   '#F59E0B',   // Amber
      error:     '#EF4444',   // Rose
    },
    text: {
      primary:   '#FFFFFF',
      secondary: '#D4D4D8',
      muted:     '#71717A',
      accent:    '#0D99FF',   // Figma Blue
      ai:        '#C084FC',   // Purple-400
    }
  },
  
  // Layout Dimensions & Grid
  layout: {
    topBarHeight:    48,
    leftTreeWidth:   240,
    rightDockWidth:  320,
    statusBarHeight: 24,
    floatingBarMaxW: 560,
  }
};
