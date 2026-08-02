export const tokens = {
  // Colors
  color: {
    bg: {
      app:       '#0a0a0a',   // outermost app background
      dock:      '#111111',   // left + right dock backgrounds
      canvas:    '#0f0f0f',   // canvas zone background
      toolbar:   '#161616',   // top toolbar background
      aiBar:     '#141414',   // AI make bar background
      statusBar: '#0a0a0a',   // status bar background
      hover:     'rgba(255, 255, 255, 0.04)', // subtle hover
      active:    'rgba(59, 130, 246, 0.08)',  // active/selected state background
      activeBlue:'rgba(59, 130, 246, 0.1)',   // slightly stronger active
    },
    border: {
      default:   '#1e1e22',   // generic borders
      dark:      '#1a1a1e',   // darker dividers
      active:    '#3B82F6',   // active selection border (blue-500)
      ai:        '#5b5bf8',   // AI accent
      success:   '#4ade80',   // green
      warning:   '#fb923c',   // orange
      error:     '#f87171',   // red
    },
    text: {
      primary:   '#ffffff',
      secondary: '#aaaaaa',
      muted:     'rgba(255, 255, 255, 0.4)',
      accent:    '#C6FF00',   // portfolio brand accent (or #3B82F6)
    }
  },
  
  // Layout Dimensions
  layout: {
    toolbarHeight:   48,
    leftDockWidth:   220,
    rightDockWidth:  280,
    aiBarHeight:     56, // collapsed
    statusBarHeight: 24,
  }
};
