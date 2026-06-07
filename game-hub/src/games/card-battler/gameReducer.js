import { drawZone, INITIAL_ENERGY, shuffleDeck } from './gameLogic';
import { ATTACK_DECK, DEFENSE_DECK, ENEMY_DECK } from './cards';

const createInitialGameState = () => {
  const initialAttackDeck = shuffleDeck(ATTACK_DECK);
  const initialDefenseDeck = shuffleDeck(DEFENSE_DECK);
  const { deck: attackDeck, discard: attackDiscard, hand } = drawZone(5, initialAttackDeck, [], []);

  return {
    player: {
      hp: 30,
      block: 0,
      energy: INITIAL_ENERGY,
      attackDeck,
      defenseDeck: initialDefenseDeck,
      attackDiscard,
      defenseDiscard: [],
      hand,
      staged: []
    },
    enemy: { hp: 30, block: 0 },
    turnOwner: 'player-turn',
    combatPhase: 'attack-phase',
    gameOver: null
  };
};

export const initialGameState = createInitialGameState();

const checkGameOver = (state) => {
  if (state.enemy.hp <= 0) {
    return {
      ...state,
      enemy: { ...state.enemy, hp: 0 },
      gameOver: 'victory'
    };
  }
  if (state.player.hp <= 0) {
    return {
      ...state,
      player: { ...state.player, hp: 0 },
      gameOver: 'defeat'
    };
  }
  return state;
};

export function gameReducer(state, action) {
  if (state.gameOver && action.type !== 'RESET_GAME') return state;

  switch (action.type) {
    case 'STAGE_CARD': {
      const card = state.player.hand.find(c => c.id === action.payload.cardId);
      const isValid = (state.combatPhase === 'attack-phase' && card.type === 'attack') || 
                      (state.combatPhase === 'defend-phase' && card.type === 'defend');
      if (!card || state.player.energy < card.cost || !isValid || state.player.staged.length >= 3) return state;
      return {
        ...state,
        player: { ...state.player, hand: state.player.hand.filter(c => c.id !== card.id), staged: [...state.player.staged, card], energy: state.player.energy - card.cost }
      };
    }
    case 'UNSTAGE_CARD': {
      const card = state.player.staged.find(c => c.id === action.payload.cardId);
      if (!card) return state;
      return {
        ...state,
        player: {
          ...state.player,
          hand: [...state.player.hand, card],
          staged: state.player.staged.filter(c => c.id !== card.id),
          energy: Math.min(INITIAL_ENERGY, state.player.energy + card.cost)
        }
      };
    }
    case 'EXECUTE_ATTACK': {
      const attackCards = state.player.staged.filter(c => c.type === 'attack');
      if (attackCards.length === 0) return state;
      const totalAttack = attackCards.reduce((sum, card) => sum + card.attack, 0);
      return checkGameOver({
        ...state,
        enemy: { ...state.enemy, hp: Math.max(0, state.enemy.hp - totalAttack) },
        player: {
          ...state.player,
          staged: [],
          attackDiscard: [...state.player.attackDiscard, ...attackCards]
        }
      });
    }
    case 'EXECUTE_DEFENSE': {
      const defenseCards = state.player.staged.filter(c => c.type === 'defend');
      if (defenseCards.length === 0) return state;
      const totalDefense = defenseCards.reduce((sum, card) => sum + card.defense, 0);
      return {
        ...state,
        player: {
          ...state.player,
          block: state.player.block + totalDefense,
          staged: [],
          defenseDiscard: [...state.player.defenseDiscard, ...defenseCards]
        }
      };
    }
    case 'ENEMY_EXECUTE_ATTACK': {
      const damage = 5;
      return checkGameOver({
        ...state,
        player: {
          ...state.player,
          hp: Math.max(0, state.player.hp - damage)
        }
      });
    }
    case 'ENEMY_EXECUTE_DEFENSE': {
      const blockAmount = 4;
      return {
        ...state,
        enemy: {
          ...state.enemy,
          block: state.enemy.block + blockAmount
        }
      };
    }
    case 'SET_PHASE': {
      return {
        ...state,
        combatPhase: action.payload.phase
      };
    }
    case 'ENEMY_END_PHASE': {
      const nextPhase = state.combatPhase === 'attack-phase' ? 'defend-phase' : 'attack-phase';
      return {
        ...state,
        combatPhase: nextPhase
      };
    }
    case 'TOGGLE_PHASE': {
      const stagedAttackCards = state.player.staged.filter(c => c.type === 'attack');
      const attackDiscard = [...state.player.attackDiscard, ...state.player.hand, ...stagedAttackCards];
      const { deck: defenseDeck, discard: defenseDiscard, hand } = drawZone(5, state.player.defenseDeck, state.player.defenseDiscard, []);

      return {
        ...state,
        combatPhase: 'defend-phase',
        player: {
          ...state.player,
          hand,
          staged: [],
          attackDiscard,
          defenseDeck,
          defenseDiscard,
          energy: INITIAL_ENERGY
        }
      };
    }
    case 'END_PLAYER_TURN': return { ...state, turnOwner: 'enemy-turn' };
    case 'START_PLAYER_TURN': {
      const defenseDiscard = [...state.player.defenseDiscard, ...state.player.hand];
      const { deck: attackDeck, discard: attackDiscard, hand } = drawZone(5, state.player.attackDeck, state.player.attackDiscard, []);

      return {
        ...state,
        turnOwner: 'player-turn',
        combatPhase: 'attack-phase',
        player: {
          ...state.player,
          energy: INITIAL_ENERGY,
          attackDeck,
          attackDiscard,
          hand,
          defenseDiscard
        }
      };
    }
    case 'RESET_GAME':
      return createInitialGameState();
    default: return state;
  }
}