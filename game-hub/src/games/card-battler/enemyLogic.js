import { drawZone, INITIAL_ENERGY } from './gameLogic';

export function handleEnemyReducer(state, action) {
  switch (action.type) {
    case 'ENEMY_EXECUTE_ATTACK': {
      if (state.isFirstTurnOfGame) return state;

      const damage = action.payload && action.payload.damage !== undefined ? action.payload.damage : 5;
      const currentBlock = state.player.block;

      let newBlock = currentBlock - damage;
      let leftoverDamage = 0;

      if (newBlock < 0) {
        leftoverDamage = Math.abs(newBlock); 
        newBlock = 0;                        
      }

      const updatedPlayerHp = Math.max(0, state.player.hp - leftoverDamage);

      return {
        ...state,
        player: { ...state.player, block: newBlock, hp: updatedPlayerHp },
        gameOver: updatedPlayerHp <= 0 ? 'defeat' : state.gameOver
      };
    }

    case 'ENEMY_EXECUTE_DEFENSE': {
      const blockAmount = action.payload && action.payload.block !== undefined ? action.payload.block : 4;
      return {
        ...state,
        enemy: { ...state.enemy, block: state.enemy.block + blockAmount }
      };
    }

    case 'ENEMY_NEXT_PHASE': {
      if (state.combatPhase === 'attack-phase') {
        return {
          ...state,
          combatPhase: 'defense-phase'
        };
      }

      if (state.combatPhase === 'defense-phase') {
        // DRAW PHASE SWITCH: Pull exactly ONE card from the Attack Deck
        const { deck: attackDeck, discard: attackDiscard, hand } = drawZone(
          1, 
          state.player.attackDeck, 
          state.player.attackDiscard, 
          state.player.hand
        );

        return {
          ...state,
          turnOwner: 'player-turn',
          combatPhase: 'attack-phase', 
          isFirstTurnOfGame: false,
          player: {
            ...state.player,
            energy: INITIAL_ENERGY,
            block: 0, 
            attackDeck,
            attackDiscard,
            hand
          }
        };
      }
      return state;
    }

    default:
      return state;
  }
}