import { FULL_DECK } from './cards';

export const MAX_HAND_SIZE = 5;
export const INITIAL_ENERGY = 3;

export const shuffleDeck = (cards) => [...cards].sort(() => Math.random() - 0.5);

export const drawZone = (count, deck, discard, hand) => {
  let d = [...deck], dis = [...discard], h = [...hand];
  for (let i = 0; i < count; i++) {
    if (h.length >= MAX_HAND_SIZE) break;
    if (d.length === 0) {
      if (dis.length === 0) break;
      d = shuffleDeck(dis);
      dis = [];
    }
    h.push(d.shift());
  }
  return { deck: d, discard: dis, hand: h };
};