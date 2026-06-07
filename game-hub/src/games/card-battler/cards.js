// cards.js

export const FULL_DECK = [
  { id: 1, name: 'Plasma Strike', cost: 1, type: 'attack', attack: 4, defense: 0, description: 'Deal 4 damage to the target.' },
  { id: 2, name: 'Photon Shield', cost: 1, type: 'defend', attack: 0, defense: 5, description: 'Gain 5 block points.' },
  { id: 3, name: 'Overcharge', cost: 2, type: 'attack', attack: 8, defense: 2, description: 'Heavy offensive output.' },
  { id: 4, name: 'Nanite Repair', cost: 3, type: 'defend', attack: 0, defense: 12, description: 'Maximum damage mitigation.' },
  { id: 5, name: 'Micro Burst', cost: 1, type: 'attack', attack: 3, defense: 0, description: 'Quick strike to weaken armor.' },
  { id: 6, name: 'Reactive Shield', cost: 2, type: 'defend', attack: 0, defense: 7, description: 'Absorb incoming fire for one turn.' },
  { id: 7, name: 'Ion Cleaver', cost: 2, type: 'attack', attack: 9, defense: 0, description: 'Pierce enemy shields with focused energy.' },
  { id: 8, name: 'Stabilize Matrix', cost: 2, type: 'defend', attack: 1, defense: 6, description: 'Defend while slightly recharging systems.' },
  { id: 9, name: 'Nano Lance', cost: 3, type: 'attack', attack: 12, defense: 0, description: 'High-impact strike that hurts through defenses.' },
  { id: 10, name: 'Fortress Protocol', cost: 3, type: 'defend', attack: 0, defense: 14, description: 'Build an advanced barrier around the core.' },
  { id: 11, name: 'Pulse Burst', cost: 1, type: 'attack', attack: 5, defense: 0, description: 'Fast energy burst that disrupts the enemy.' },
  { id: 12, name: 'Kinetic Field', cost: 2, type: 'defend', attack: 2, defense: 5, description: 'Generate a field to deflect incoming damage.' },
  { id: 13, name: 'Phase Strike', cost: 2, type: 'attack', attack: 7, defense: 1, description: 'Strike and reframe your stabilizers.' },
  { id: 14, name: 'Aegis Feedback', cost: 3, type: 'defend', attack: 3, defense: 10, description: 'Reinforce shields and counterattack.' },
  { id: 15, name: 'EMP Shard', cost: 1, type: 'attack', attack: 2, defense: 0, description: 'Weak attack that leaves the enemy exposed.' },
  { id: 16, name: 'Quantum Deflector', cost: 2, type: 'defend', attack: 0, defense: 8, description: 'Redirect energy to keep the core safe.' },
  { id: 17, name: 'Energy Channel', cost: 1, type: 'support', attack: 0, defense: 0, heal: 0, draw: 1, description: 'Draw a card as you focus your power.' },
  { id: 18, name: 'Repair Drone', cost: 2, type: 'support', attack: 0, defense: 0, heal: 4, draw: 0, description: 'Restore hull integrity while holding position.' },
  { id: 19, name: 'Spectral Strike', cost: 3, type: 'attack', attack: 10, defense: 0, description: 'A heavy attack that forces the enemy to react.' },
  { id: 20, name: 'Aegis Herald', cost: 2, type: 'support', attack: 1, defense: 4, heal: 0, draw: 0, description: 'Strengthen defenses and prepare for follow-up strikes.' },
];

export const ATTACK_DECK = FULL_DECK.filter((card) => card.type === 'attack');
export const DEFENSE_DECK = FULL_DECK.filter((card) => card.type === 'defend');

export const ENEMY_DECK = FULL_DECK.map((card) => ({
  ...card,
  id: card.id + 100,
  name: `Opponent ${card.name}`,
}));