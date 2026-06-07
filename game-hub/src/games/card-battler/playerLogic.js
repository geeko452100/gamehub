import { drawZone, INITIAL_ENERGY } from './gameLogic';

export function handlePlayerReducer(state, action) {
  switch (action.type) {
    case 'STAGE_CARD': {
      const cardId = String(action.payload.cardId);
      const card = state.player.hand.find(c => String(c.id) === cardId);
      const isValid = card && (
        (state.combatPhase === 'attack-phase' && card.type === 'attack') || 
        (state.combatPhase === 'defense-phase' && card.type === 'defend')
    );
      if (!card || state.player.energy < card.cost || !isValid || state.player.staged.length >= 3) return state;
      return {
        ...state,
        player: { 
          ...state.player, 
          hand: state.player.hand.filter(c => String(c.id) !== cardId), 
          staged: [...state.player.staged, card], 
          energy: state.player.energy - card.cost 
        }
      };
    }

    case 'UNSTAGE_CARD': {
      const cardId = String(action.payload.cardId);
      const card = state.player.staged.find(c => String(c.id) === cardId);
      if (!card) return state;
      return {
        ...state,
        player: {
          ...state.player,
          hand: [...state.player.hand, card],
          staged: state.player.staged.filter(c => String(c.id) !== cardId),
          energy: Math.min(INITIAL_ENERGY, state.player.energy + card.cost)
        }
      };
    }

    case 'DISCARD_CARD': {
      const cardId = String(action.payload.cardId);
      const card = state.player.hand.find(c => String(c.id) === cardId);
      if (!card) return state;

      const isAttack = card.type === 'attack';
      return {
        ...state,
        player: {
          ...state.player,
          hand: state.player.hand.filter(c => String(c.id) !== cardId),
          attackDiscard: isAttack ? [...state.player.attackDiscard, card] : state.player.attackDiscard,
          defenseDiscard: !isAttack ? [...state.player.defenseDiscard, card] : state.player.defenseDiscard
        }
      };
    }

    case 'EXECUTE_ATTACK': {
      if (state.isFirstTurnOfGame) return state;

      const attackCards = state.player.staged.filter(c => c.type === 'attack');
      if (attackCards.length === 0) return state;
      const totalAttack = attackCards.reduce((sum, card) => sum + card.attack, 0);

      const currentEnemyBlock = state.enemy.block;
      let newEnemyBlock = currentEnemyBlock - totalAttack;
      let leftoverDamage = 0;

      if (newEnemyBlock < 0) {
        leftoverDamage = Math.abs(newEnemyBlock); 
        newEnemyBlock = 0;                        
      }

      const updatedEnemyHp = Math.max(0, state.enemy.hp - leftoverDamage);

      return {
        ...state,
        enemy: { ...state.enemy, block: newEnemyBlock, hp: updatedEnemyHp },
        player: {
          ...state.player,
          staged: [],
          attackDiscard: [...state.player.attackDiscard, ...attackCards]
        },
        gameOver: updatedEnemyHp <= 0 ? 'victory' : state.gameOver
      };
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

    case 'PLAYER_NEXT_PHASE': {
      if (state.combatPhase === 'attack-phase') {
        const stagedAttackCards = state.player.staged.filter(c => c.type === 'attack');
        const attackDiscard = [...state.player.attackDiscard, ...stagedAttackCards];
        
        // DRAW PHASE SWITCH: Pull exactly ONE card from the Defense Deck
        const { deck: defenseDeck, discard: defenseDiscard, hand } = drawZone(
          1, 
          state.player.defenseDeck, 
          state.player.defenseDiscard, 
          state.player.hand
        );

        return {
          ...state,
          combatPhase: 'defense-phase',
          isFirstTurnOfGame: false, 
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
      
      if (state.combatPhase === 'defense-phase') {
        const stagedDefenseCards = state.player.staged.filter(c => c.type === 'defend');
        const defenseDiscard = [...state.player.defenseDiscard, ...stagedDefenseCards];

        return {
          ...state,
          turnOwner: 'enemy-turn',
          combatPhase: 'attack-phase',
          isFirstTurnOfGame: false,
          player: {
            ...state.player,
            staged: [],
            defenseDiscard
          }
        };
      }
      return state;
    }

    default:
      return state;
  }
}