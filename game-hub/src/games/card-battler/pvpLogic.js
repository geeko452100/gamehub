import { drawZone, INITIAL_ENERGY } from './gameLogic';

/**
 * Returns the active/target player state keys based on whose turn it is.
 * Uses String() coercion to prevent type-mismatch bugs (e.g. number vs string IDs).
 */
function getPlayerKeys(state, executionUserId) {
  const isPlayer1 = String(executionUserId) === String(state.player_1_id);
  return {
    activeKey: isPlayer1 ? 'player_1' : 'player_2',
    targetKey: isPlayer1 ? 'player_2' : 'player_1',
  };
}

/** Actions that must belong to the current turn owner. */
const TURN_LOCKED = new Set([
  'STAGE_CARD',
  'UNSTAGE_CARD',
  'EXECUTE_ATTACK',
  'EXECUTE_DEFENSE',
  'NEXT_PHASE',
  'DISCARD_CARD',
]);

export function handlePvPReducer(state, action) {
  const { userId } = action.payload;

  // Turn-lock guard — silently reject out-of-turn actions.
  if (TURN_LOCKED.has(action.type) && String(state.turnOwner) !== String(userId)) {
    console.warn('Action blocked: not your turn.', { expected: state.turnOwner, got: userId });
    return state;
  }

  const { activeKey, targetKey } = getPlayerKeys(state, userId);
  const active = state[activeKey];
  const target = state[targetKey];

  switch (action.type) {
    // ─── STAGE_CARD ──────────────────────────────────────────────────────────
    case 'STAGE_CARD': {
      const { cardId } = action.payload;
      // BUG FIX: Search by instanceId (unique per card instance) not id (shared by card type).
      const cardIndex = active.hand.findIndex((c) => c.instanceId === cardId);
      if (cardIndex === -1) return state;

      const card = active.hand[cardIndex];

      // Prevent staging a card you can't afford.
      if (card.cost > active.energy) return state;

      const newHand   = active.hand.filter((_, i) => i !== cardIndex);
      const newStaged = [...active.staged, card];

      return {
        ...state,
        [activeKey]: {
          ...active,
          hand:   newHand,
          staged: newStaged,
          energy: active.energy - card.cost,
        },
      };
    }

    // ─── UNSTAGE_CARD ─────────────────────────────────────────────────────────
    case 'UNSTAGE_CARD': {
      const { cardId } = action.payload;
      const cardIndex = active.staged.findIndex((c) => c.instanceId === cardId);
      if (cardIndex === -1) return state;

      const card      = active.staged[cardIndex];
      const newStaged = active.staged.filter((_, i) => i !== cardIndex);

      return {
        ...state,
        [activeKey]: {
          ...active,
          staged: newStaged,
          hand:   [...active.hand, card],
          energy: active.energy + card.cost,
        },
      };
    }

    // ─── EXECUTE_ATTACK ───────────────────────────────────────────────────────
    case 'EXECUTE_ATTACK': {
      const attackCards = active.staged.filter((c) => c.type === 'attack');
      if (attackCards.length === 0) return state;

      const totalAttack = attackCards.reduce((sum, c) => sum + c.attack, 0);
      const damageAfterBlock = Math.max(0, totalAttack - target.block);
      const remainingBlock   = Math.max(0, target.block - totalAttack);

      // Non-attack staged cards return to hand.
      const nonAttackStaged = active.staged.filter((c) => c.type !== 'attack');

      const newTargetHp = Math.max(0, target.hp - damageAfterBlock);
      const gameOver = newTargetHp <= 0
        ? { winnerId: userId, reason: 'hp-depleted' }
        : null;

      return {
        ...state,
        gameOver,
        [activeKey]: {
          ...active,
          staged:        nonAttackStaged,
          attackDiscard: [...(active.attackDiscard ?? []), ...attackCards],
        },
        [targetKey]: {
          ...target,
          hp:    newTargetHp,
          block: remainingBlock,
        },
      };
    }

    // ─── EXECUTE_DEFENSE ──────────────────────────────────────────────────────
    case 'EXECUTE_DEFENSE': {
      const defenseCards = active.staged.filter((c) => c.type === 'defend');
      if (defenseCards.length === 0) return state;

      const totalDefense = defenseCards.reduce((sum, c) => sum + c.defense, 0);

      // Non-defense staged cards return to hand.
      const nonDefenseStaged = active.staged.filter((c) => c.type !== 'defend');

      return {
        ...state,
        [activeKey]: {
          ...active,
          staged:         nonDefenseStaged,
          block:          active.block + totalDefense,
          defenseDiscard: [...(active.defenseDiscard ?? []), ...defenseCards],
        },
      };
    }

    // ─── NEXT_PHASE ───────────────────────────────────────────────────────────
    case 'NEXT_PHASE': {
      const isAttackPhase = state.combatPhase === 'attack-phase';

      if (isAttackPhase) {
        // Move from attack → defense; same player keeps the turn.
        return {
          ...state,
          combatPhase:    'defense-phase',
          turnExpiration: Date.now() + 30_000,
        };
      }

      // End of defense phase → flip turn owner, reset energy & block, draw a card.
      const nextTurnOwner = String(state.turnOwner) === String(state.player_1_id)
        ? state.player_2_id
        : state.player_1_id;

      // Return any remaining staged cards to hand before ending turn.
      const { hand: drawnHand } = drawZone(1, [], active.defenseDiscard ?? [], [
        ...active.hand,
        ...active.staged,
      ]);

      return {
        ...state,
        combatPhase:    'attack-phase',
        turnOwner:      nextTurnOwner,
        turnExpiration: Date.now() + 30_000,
        [activeKey]: {
          ...active,
          staged: [],
          block:  0,
          energy: INITIAL_ENERGY,
          hand:   drawnHand,
        },
      };
    }

    // ─── DISCARD_CARD ─────────────────────────────────────────────────────────
    case 'DISCARD_CARD': {
      const { cardId } = action.payload;
      const cardIndex = active.hand.findIndex((c) => c.instanceId === cardId);
      if (cardIndex === -1) return state;

      const card    = active.hand[cardIndex];
      const newHand = active.hand.filter((_, i) => i !== cardIndex);
      const discardKey = card.type === 'attack' ? 'attackDiscard' : 'defenseDiscard';

      return {
        ...state,
        [activeKey]: {
          ...active,
          hand:       newHand,
          [discardKey]: [...(active[discardKey] ?? []), card],
        },
      };
    }

    default:
      return state;
  }
}
