export const colors = {
  // Core
  primary: '#6366F1',        // Indigo 500 (slightly lighter for dark bg)
  primaryLight: '#818CF8',   // Indigo 400
  primaryDark: '#4338CA',    // Indigo 700
  primaryGradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',

  // Backgrounds (DARK THEME)
  background: '#0F0B1E',     // Deep dark purple-black
  backgroundSecondary: '#1A1333',  // Slightly lighter for cards
  surface: '#211B3A',        // Card surface
  surfaceHover: '#2A2248',   // Card hover state
  surfaceElevated: '#2D2545', // Elevated cards (modals, decisions)

  // Card gradient (the Visa card)
  cardGradient: 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)',

  // Text
  textPrimary: '#F1F0FF',    // Almost white with purple tint
  textSecondary: '#A5A0C8',  // Muted purple-gray
  textMuted: '#6B6490',      // Very muted

  // Accents
  success: '#34D399',        // Emerald 400 (brighter for dark bg)
  danger: '#FB7185',         // Rose 400
  warning: '#FBBF24',        // Amber 400
  accentCyan: '#22D3EE',     // Cyan 400 (new — for XP, streaks)
  accentPink: '#F472B6',     // Pink 400
  accentGold: '#FCD34D',     // Gold for legendary/coins

  // Borders
  border: '#2D2545',
  borderLight: '#1E1838',
  borderGlow: 'rgba(99, 102, 241, 0.3)',  // Purple glow for focus

  // Input
  inputBg: '#1A1333',

  // Glow effects
  glowPrimary: '0 0 20px rgba(99, 102, 241, 0.4)',
  glowSuccess: '0 0 15px rgba(52, 211, 153, 0.3)',
  glowDanger: '0 0 15px rgba(251, 113, 133, 0.3)',
  glowGold: '0 0 20px rgba(252, 211, 77, 0.4)',
  glowCyan: '0 0 15px rgba(34, 211, 238, 0.3)',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 };

export const shadows = {
  card: '0 2px 12px rgba(0, 0, 0, 0.3)',
  elevated: '0 8px 32px rgba(0, 0, 0, 0.4)',
  bankCard: '0 8px 32px rgba(67, 56, 202, 0.35)',
  glow: '0 0 30px rgba(99, 102, 241, 0.2)',
  none: 'none',
};

// Animation keyframes to inject into layout.tsx <style> tag
export const globalAnimations = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes xpGrow { from { width: 0; } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); } 50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); } }
  @keyframes coinFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-40px); opacity: 0; }
  }
  @keyframes confettiBurst {
    0% { transform: scale(0) rotate(0); opacity: 1; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }
  @keyframes cardFlip {
    0% { transform: perspective(800px) rotateY(0); }
    50% { transform: perspective(800px) rotateY(90deg); }
    100% { transform: perspective(800px) rotateY(0); }
  }
  @keyframes streakFire {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
  }
  @keyframes celebrateFloat {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-60px); opacity: 0; }
  }
  @keyframes celebrateZoomIn {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes celebrateLevelFly {
    0% { transform: translateY(80px) scale(0.5); opacity: 0; }
    50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes celebrateParticle {
    0% { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes celebrateCheckmark {
    0% { transform: scale(0); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes celebrateCountUp {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes celebrateShield {
    0% { transform: scale(0) rotate(-15deg); opacity: 0; }
    50% { transform: scale(1.15) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  @keyframes celebrateGoldFlash {
    0% { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0); }
    50% { box-shadow: 0 0 30px 8px rgba(252, 211, 77, 0.5); }
    100% { box-shadow: 0 0 0 0 rgba(252, 211, 77, 0); }
  }
  @keyframes celebrateSparkle {
    0% { transform: scale(0) rotate(0); opacity: 0; }
    50% { transform: scale(1) rotate(180deg); opacity: 1; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }
  @keyframes celebrateStreakPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }
`;
