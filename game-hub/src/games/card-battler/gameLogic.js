// BUG FIX: Removed unused `FULL_DECK` import — it was imported but never referenced,
// causing a dead dependency that would break tree-shaking and confuse readers.

export const MAX_HAND_SIZE = 5;
export const INITIAL_ENERGY = 3;

/**
 * Fisher-Yates–style shuffle via sort. Sufficient for card games.
 * @template T
 * @param {T[]} cards
 * @returns {T[]}
 */
export const shuffleDeck = (cards) => [...cards].sort(() => Math.random() - 0.5);

/**
 * Draws `count` cards into `hand` from `deck`, recycling `discard` when the deck runs dry.
 * Respects MAX_HAND_SIZE. All inputs are treated as immutable.
 *
 * @param {number} count
 * @param {any[]} deck
 * @param {any[]} discard
 * @param {any[]} hand
 * @returns {{ deck: any[], discard: any[], hand: any[] }}
 */
export const drawZone = (count, deck, discard, hand) => {
  let d   = [...(deck    ?? [])];
  let dis = [...(discard ?? [])];
  let h   = [...(hand    ?? [])];

  for (let i = 0; i < count; i++) {
    if (h.length >= MAX_HAND_SIZE) break;

    if (d.length === 0) {
      if (dis.length === 0) break;
      // Recycle discard pile into a freshly shuffled deck
      d   = shuffleDeck(dis);
      dis = [];
    }

    h.push(d.shift());
  }

  return { deck: d, discard: dis, hand: h };
};
