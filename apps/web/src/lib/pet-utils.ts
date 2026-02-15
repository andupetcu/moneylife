import type { GameResponse } from './api';

export type PetState = 'thriving' | 'healthy' | 'worried' | 'struggling';
export type PetStage = 1 | 2 | 3;
export type PetSpecies = 'fox' | 'owl' | 'wolf' | 'dragon';

export function getPetState(game: GameResponse): PetState {
  const netWorth = game.netWorth ?? 0;
  const creditHealth = game.creditHealthIndex ?? 50;

  if (netWorth < 0 || creditHealth < 400) return 'struggling';
  if (netWorth < 0 || creditHealth < 600) return 'worried';

  // Thriving: positive net worth and good credit
  if (netWorth > 0 && creditHealth > 70) return 'thriving';

  return 'healthy';
}

export function getPetStage(level: number): PetStage {
  if (level >= 7) return 3;
  if (level >= 4) return 2;
  return 1;
}

export function getPetSpecies(persona: string): PetSpecies {
  switch (persona) {
    case 'teen': return 'fox';
    case 'student': return 'owl';
    case 'young_adult': return 'wolf';
    case 'parent': return 'dragon';
    default: return 'fox';
  }
}

export function getPetMoodText(state: PetState): { emoji: string; text: string } {
  switch (state) {
    case 'thriving': return { emoji: '🌟', text: 'Thriving!' };
    case 'healthy': return { emoji: '😊', text: 'Happy' };
    case 'worried': return { emoji: '😟', text: 'Worried' };
    case 'struggling': return { emoji: '😢', text: 'Needs help' };
  }
}

export function getHabitatElements(level: number): string[] {
  const elements: string[] = ['ground', 'sky'];
  if (level >= 2) elements.push('tree');
  if (level >= 4) elements.push('house');
  if (level >= 6) elements.push('decorations');
  if (level >= 8) elements.push('palace');
  return elements;
}

const PET_NAMES: Record<PetSpecies, string[]> = {
  fox: ['Ember', 'Blaze', 'Rusty'],
  owl: ['Sage', 'Luna', 'Mystic'],
  wolf: ['Frost', 'Storm', 'Shadow'],
  dragon: ['Aurum', 'Rex', 'Phoenix'],
};

export function getPetName(persona: string, stage: PetStage): string {
  const species = getPetSpecies(persona);
  return PET_NAMES[species][stage - 1];
}

export const SPECIES_COLORS: Record<PetSpecies, { primary: string; secondary: string; glow: string }> = {
  fox: { primary: '#F97316', secondary: '#FCD34D', glow: 'rgba(249, 115, 22, 0.4)' },
  owl: { primary: '#7C3AED', secondary: '#818CF8', glow: 'rgba(124, 58, 237, 0.4)' },
  wolf: { primary: '#22D3EE', secondary: '#6366F1', glow: 'rgba(34, 211, 238, 0.4)' },
  dragon: { primary: '#FCD34D', secondary: '#F97316', glow: 'rgba(252, 211, 77, 0.4)' },
};
