import { handlePlayerReducer } from './playerLogic';
import { handleEnemyReducer } from './enemyLogic';
import { INITIAL_ENERGY, shuffleDeck, drawZone } from './gameLogic';
import { ATTACK_DECK, DEFENSE_DECK } from './cards';

const createInitialGameState = () => {
  // 1. Initialize separated structural layout decks
  let attackDeck = shuffleDeck(ATTACK_DECK);
  let defenseDeck = shuffleDeck(DEFENSE_DECK);
  
  let attackDiscard = [];
  let defenseDiscard = [];

  // 2. Exact initial hand breakdown: 3 Attack cards, 4 Defense cards
  const initialAttackDraw = drawZone(3, attackDeck, attackDiscard, []);
  attackDeck = initialAttackDraw.deck;
  attackDiscard = initialAttackDraw.discard;
  const attackHandPart = initialAttackDraw.hand;

  const initialDefenseDraw = drawZone(4, defenseDeck, defenseDiscard, []);
  defenseDeck = initialDefenseDraw.deck;
  defenseDiscard = initialDefenseDraw.discard;
  const defenseHandPart = initialDefenseDraw.hand;

  // Combine arrays to construct the 7-card starting pool
  const startingHand = [...attackHandPart, ...defenseHandPart];

  const heads = Math.random() < 0.5;
  const initialTurnOwner = heads ? 'player-turn' : 'enemy-turn';
  const goesFirst = initialTurnOwner === 'player-turn';

  return {
    player: {
      hp: 50,
      block: 0,
      energy: INITIAL_ENERGY,
      attackDeck,
      defenseDeck,
      attackDiscard,
      defenseDiscard,
      hand: startingHand,
      staged: []
    },
    enemy: { hp: 50, block: 0 },
    turnOwner: initialTurnOwner,
    combatPhase: goesFirst ? 'defense-phase' : 'attack-phase',
    startFlip: heads ? 'Heads' : 'Tails',
    startId: Date.now(),
    gameOver: null,
    isFirstTurnOfGame: true 
  };
};

export const initialGameState = createInitialGameState();

export function gameReducer(state, action) {
  if (state.gameOver && action.type !== 'RESET_GAME') return state;
  if (action.type === 'RESET_GAME') return createInitialGameState();

  if ([
    'STAGE_CARD', 'UNSTAGE_CARD', 'DISCARD_CARD', 
    'EXECUTE_ATTACK', 'EXECUTE_DEFENSE', 'PLAYER_NEXT_PHASE'
  ].includes(action.type)) {
    return handlePlayerReducer(state, action);
  }

  if ([
    'ENEMY_EXECUTE_ATTACK', 'ENEMY_EXECUTE_DEFENSE', 'ENEMY_NEXT_PHASE'
  ].includes(action.type)) {
    return handleEnemyReducer(state, action);
  }

  return state;
}