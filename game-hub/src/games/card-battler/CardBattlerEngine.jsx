// @ts-nocheck
import { useState, useEffect } from 'react';
import GameCard from './components/GameCard';
import { Swords, Shield, Activity } from 'lucide-react';

const FULL_DECK = [
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

const ENEMY_DECK = FULL_DECK.map((card) => ({
  ...card,
  id: card.id + 100,
  name: `Opponent ${card.name}`,
}));

const MAX_HAND_SIZE = 7;
const STARTING_HAND_SIZE = 5;
const INITIAL_ENERGY = 3;

const shuffleDeck = (cards) => {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const initializeHands = () => {
  const playerStartingDeck = shuffleDeck(FULL_DECK);
  const playerDraw = drawZone(STARTING_HAND_SIZE, playerStartingDeck, [], []);
  const enemyStartingDeck = shuffleDeck(ENEMY_DECK);
  const enemyDraw = drawZone(STARTING_HAND_SIZE, enemyStartingDeck, [], []);

  return { playerDraw, enemyDraw };
};

const drawZone = (count, currentDeck, currentDiscard, currentHand) => {
  const deck = [...currentDeck];
  let discard = [...currentDiscard];
  const hand = [...currentHand];
  let remaining = count;
  let deckOut = false;

  while (hand.length < MAX_HAND_SIZE && remaining > 0) {
    if (deck.length === 0 && discard.length > 0) {
      deck.push(...shuffleDeck(discard));
      discard = [];
    }

    if (deck.length === 0) {
      deckOut = true;
      break;
    }
    hand.push(deck.shift());
    remaining -= 1;
  }

  return { deck, discard, hand, deckOut };
};

export default function CardBattlerEngine() {
  // Game Metrics States
  const [playerHp, setPlayerHp] = useState(30);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(INITIAL_ENERGY);
  const [deck, setDeck] = useState(() => shuffleDeck(FULL_DECK));
  const [discardPile, setDiscardPile] = useState([]);
  const [hand, setHand] = useState([]);

  const [enemyHp, setEnemyHp] = useState(35);
  const [enemyBlock, setEnemyBlock] = useState(0);
  const [enemyDeck, setEnemyDeck] = useState(() => shuffleDeck(ENEMY_DECK));
  const [enemyHand, setEnemyHand] = useState([]);
  const [enemyDiscard, setEnemyDiscard] = useState([]);
  
  // Lifecycle Phase Controllers
  const [turnOwner, setTurnOwner] = useState('player-turn');
  const [turnPhase, setTurnPhase] = useState('main-phase');
  const [aiLog, setAiLog] = useState('Awaiting tactical deployment...');
  
  // Visual Tracking State Matrix
  const [activeResolution, setActiveResolution] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const enemyIsDefeated = enemyHp <= 0;
  const playerIsDefeated = playerHp <= 0;
  const gameOver = Boolean(gameResult) || enemyIsDefeated || playerIsDefeated;

  const endGame = (result) => {
    if (gameResult) return;
    setGameResult(result);
    setActiveResolution(null);
    if (result === 'victory') {
      setAiLog('Victory! The opponent deck has been exhausted or the enemy core was destroyed.');
    } else if (result === 'defeat') {
      setAiLog('Defeat. Your core has been destroyed.');
    } else if (result === 'deckout') {
      setAiLog('Deck-out! You cannot draw any more cards and lose the duel.');
    }
  };

  const resetGame = () => {
    const { playerDraw, enemyDraw } = initializeHands();

    setPlayerHp(30);
    setPlayerBlock(0);
    setPlayerEnergy(INITIAL_ENERGY);
    setDeck(playerDraw.deck);
    setDiscardPile(playerDraw.discard);
    setHand(playerDraw.hand);
    setEnemyHp(35);
    setEnemyBlock(0);
    setEnemyDeck(enemyDraw.deck);
    setEnemyHand(enemyDraw.hand);
    setEnemyDiscard(enemyDraw.discard);
    setTurnOwner('player-turn');
    setTurnPhase('draw-phase');
    setAiLog('Awaiting tactical deployment...');
    setActiveResolution(null);
    setGameResult(null);
  };

  const drawPlayerCards = (count) => {
    if (gameOver || count <= 0) return;

    const drawResult = drawZone(count, deck, discardPile, hand);
    if (drawResult.deckOut) {
      endGame('deckout');
      return;
    }

    setDeck(drawResult.deck);
    setDiscardPile(drawResult.discard);
    setHand(drawResult.hand);
  };

  const drawEnemyCards = (count, currentDeck = enemyDeck, currentDiscard = enemyDiscard, currentHand = enemyHand) => {
    if (count <= 0) return { deck: currentDeck, discard: currentDiscard, hand: currentHand };

    const drawResult = drawZone(count, currentDeck, currentDiscard, currentHand);
    if (drawResult.deckOut) {
      endGame('victory');
      return drawResult;
    }

    setEnemyDeck(drawResult.deck);
    setEnemyDiscard(drawResult.discard);
    setEnemyHand(drawResult.hand);
    return drawResult;
  };

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (gameOver) return;
    drawPlayerCards(STARTING_HAND_SIZE);
    drawEnemyCards(STARTING_HAND_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (enemyIsDefeated && !gameResult) {
      const playerStartingDeck = shuffleDeck(FULL_DECK);
      const drawResult = drawZone(STARTING_HAND_SIZE, playerStartingDeck, [], []);
      setDeck(drawResult.deck);
      setDiscardPile([]);
      setHand(drawResult.hand);
      endGame('victory');
      return;
    }
    if (playerIsDefeated && !gameResult) {
      const drawResult = drawZone(STARTING_HAND_SIZE, deck, discardPile, []);
      setDeck(drawResult.deck);
      setDiscardPile(drawResult.discard);
      setHand(drawResult.hand);
      endGame('defeat');
      return;
    }
  }, [enemyIsDefeated, playerIsDefeated, gameResult]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (gameOver || turnOwner !== 'player-turn' || turnPhase !== 'draw-phase') return;

    setAiLog('Draw phase: drawing a card for your turn.');
    setPlayerEnergy(INITIAL_ENERGY);
    drawPlayerCards(1);
    setTurnPhase('main-phase');
  }, [turnOwner, turnPhase, gameOver]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-use-before-define */
  useEffect(() => {
    if (gameOver || turnOwner !== 'enemy-turn') return;

    setAiLog('Opponent Trainer preparing a response...');
    setActiveResolution({ type: 'thinking', message: 'Opponent turn in progress' });

    const aiDecisionTimer = setTimeout(() => {
      enemyPlayTurn();
    }, 1400);

    return () => clearTimeout(aiDecisionTimer);
  }, [turnOwner, gameOver]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-use-before-define */

  useEffect(() => {
    if (enemyIsDefeated) {
      setAiLog('Enemy core neutralized. Victory achieved.');
      setActiveResolution(null);
      return;
    }

    if (playerIsDefeated) {
      setAiLog('Player core destroyed. Mission failure.');
      setActiveResolution(null);
    }
  }, [enemyIsDefeated, playerIsDefeated]);

  function enemyPlayTurn() {
    const baseEnergy = INITIAL_ENERGY;
    const drawResult = drawZone(1, enemyDeck, enemyDiscard, enemyHand);
    let nextHand = [...drawResult.hand];
    const playable = nextHand.filter(card => card.cost <= baseEnergy);

    if (playable.length === 0) {
      setEnemyDeck(drawResult.deck);
      setEnemyDiscard(drawResult.discard);
      setEnemyHand(nextHand);
      setAiLog('Opponent has no playable cards and passes.');

      setTimeout(() => {
        setTurnOwner('player-turn');
        setTurnPhase('draw-phase');
        setActiveResolution(null);
        setAiLog('Your turn. Draw phase active.');
      }, 1400);

      return;
    }

    const chosen = playable.reduce((best, card) => {
      const score = (card.attack || 0) * 2 + (card.defense || 0) + (card.heal || 0) + (card.draw ? 1 : 0);
      const bestScore = (best.attack || 0) * 2 + (best.defense || 0) + (best.heal || 0) + (best.draw ? 1 : 0);
      return score > bestScore ? card : best;
    }, playable[0]);

    nextHand = nextHand.filter(c => c.id !== chosen.id);
    const nextDiscard = [...drawResult.discard, chosen];
    setEnemyDeck(drawResult.deck);
    setEnemyDiscard(nextDiscard);
    setEnemyHand(nextHand);

    const actionType = chosen.attack > 0 ? 'attack' : chosen.defense > 0 ? 'defend' : 'support';
    const actionMessage = chosen.attack > 0
      ? `Opponent plays ${chosen.name} and attacks for ${chosen.attack}.`
      : chosen.defense > 0
        ? `Opponent plays ${chosen.name} and shields for ${chosen.defense}.`
        : `Opponent plays ${chosen.name}.`;

    setActiveResolution({ type: actionType, message: actionMessage });

    if (chosen.attack > 0) {
      setPlayerHp(prev => {
        const netDamage = Math.max(0, chosen.attack - playerBlock);
        setPlayerBlock(currentBlock => Math.max(0, currentBlock - chosen.attack));
        return Math.max(0, prev - netDamage);
      });
    }

    if (chosen.defense > 0) {
      setEnemyBlock(prev => prev + chosen.defense);
    }

    if (chosen.heal) {
      setEnemyHp(prev => Math.min(35, prev + chosen.heal));
    }

    if (chosen.draw) {
      const drawEffect = drawZone(chosen.draw, drawResult.deck, nextDiscard, nextHand);
      setEnemyDeck(drawEffect.deck);
      setEnemyDiscard(drawEffect.discard);
      setEnemyHand(drawEffect.hand);
    }

    setTimeout(() => {
      setTurnOwner('player-turn');
      setTurnPhase('draw-phase');
      setActiveResolution(null);
      setAiLog('Your turn. Draw phase active.');
    }, 1800);
  };

  const handlePlayCard = (cardId) => {
    if (turnOwner !== 'player-turn' || turnPhase !== 'main-phase' || gameOver) return;

    const card = hand.find(c => c.id === cardId);
    if (!card || playerEnergy < card.cost) return;

    // Load card context into visual execution zone
    setActiveResolution({ type: 'player-card', card });

    // Spend resources and resolve effects
    setPlayerEnergy(prev => prev - card.cost);

    if (card.attack > 0) {
      setEnemyHp(prev => {
        const netDamage = Math.max(0, card.attack - enemyBlock);
        setEnemyBlock(currentBlock => Math.max(0, currentBlock - card.attack));
        return Math.max(0, prev - netDamage);
      });
    }

    if (card.defense > 0) {
      setPlayerBlock(prev => prev + card.defense);
    }

    if (card.heal) {
      setPlayerHp(prev => Math.min(30, prev + card.heal));
    }

    const nextHand = hand.filter(c => c.id !== cardId);
    let nextDiscard = [...discardPile, card];
    let nextDeck = [...deck];
    let nextHandAfterDraw = nextHand;

    if (card.draw) {
      const drawResult = drawZone(card.draw, nextDeck, nextDiscard, nextHand);
      nextDeck = drawResult.deck;
      nextDiscard = drawResult.discard;
      nextHandAfterDraw = drawResult.hand;
    }

    setHand(nextHandAfterDraw);
    setDeck(nextDeck);
    setDiscardPile(nextDiscard);

    // Automatically dismiss resolution layout after brief window
    setTimeout(() => {
      setActiveResolution(null);
    }, 8000);
  };

  const handleEndTurn = () => {
    if (turnOwner !== 'player-turn') return;
    setEnemyBlock(0);
    setTurnOwner('enemy-turn');
  };

  return (
    <>
      <div className="space-y-6">
      {/* Game Match Header Dashboard */}
      <div className="grid grid-cols-2 gap-4 bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-xs uppercase font-mono tracking-widest text-slate-500">Player Core status</h2>
          <div className="text-2xl font-black text-emerald-400">
            {playerHp} <span className="text-xs text-slate-500 font-normal">/ 30 HP</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className="bg-indigo-950 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded">
              Energy: {playerEnergy}/3
            </span>
            {playerBlock > 0 && (
              <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
                Block: +{playerBlock}
              </span>
            )}
            <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
              Hand: {hand.length}/{MAX_HAND_SIZE}
            </span>
            <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
              Deck: {deck.length}
            </span>
            <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
              Discard: {discardPile.length}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-right">
          <h2 className="text-xs uppercase font-mono tracking-widest text-slate-500">Opponent Engine node</h2>
          <div className="text-2xl font-black text-rose-500">
            {enemyHp} <span className="text-xs text-slate-500 font-normal">/ 35 HP</span>
          </div>
          <div className="flex gap-2 text-xs font-mono justify-end">
            {enemyBlock > 0 && (
              <span className="bg-amber-950 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded">
                Block: +{enemyBlock}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded border transition-colors ${
              turnOwner === 'enemy-turn' 
                ? 'bg-rose-950/40 text-rose-400 border-rose-500 animate-pulse' 
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {turnOwner === 'enemy-turn'
                ? 'Opponent Turn'
                : turnPhase === 'draw-phase'
                  ? 'Draw Phase'
                  : 'Main Phase'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Action Resolution Arena Zone */}
      <div className="h-56 rounded-xl border border-slate-800 flex items-center justify-center bg-slate-950 relative overflow-hidden shadow-inner">
        {/* Abstract structural grid wires background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20"></div>

        {!activeResolution && (
          <div className="text-xs font-mono text-slate-600 z-10 flex flex-col items-center gap-2">
            <Activity className="w-5 h-5 animate-pulse text-slate-700" />
            <span>Awaiting System Execution Pipeline</span>
          </div>
        )}

        {/* Visual Render Option 1: Player Card State Resolution */}
        {activeResolution?.type === 'player-card' && (
          <div className="z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center gap-2">
            <div className="scale-90 origin-center pointer-events-none">
              <GameCard card={activeResolution.card} onPlay={() => {}} canAfford={true} />
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded uppercase tracking-wider">
              Resolving Actions...
            </span>
          </div>
        )}

        {/* Visual Render Option 2: Enemy Operational Calculation Phase */}
        {activeResolution?.type === 'thinking' && (
          <div className="z-10 text-center space-y-2 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-rose-400 tracking-widest font-bold">{activeResolution.message}</p>
          </div>
        )}

        {/* Visual Render Option 3: Enemy Strike Animation Event */}
        {(activeResolution?.type === 'attack' || activeResolution?.type === 'defend') && (
          <div className="z-10 text-center p-6 rounded-xl bg-slate-900 border border-rose-900/30 max-w-sm w-full mx-4 shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-3">
              {activeResolution.type === 'attack' ? (
                <Swords className="w-10 h-10 text-rose-500 animate-bounce" />
              ) : (
                <Shield className="w-10 h-10 text-amber-400 animate-pulse" />
              )}
            </div>
            <p className={`text-sm font-mono font-black ${activeResolution.type === 'attack' ? 'text-rose-400' : 'text-amber-400'}`}>
              {activeResolution.message}
            </p>
          </div>
        )}
      </div>

      {/* Action System Log Console */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 shadow-inner">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">System Action Log //</div>
        <p className={turnOwner === 'enemy-turn' ? 'text-amber-400 font-bold' : 'text-slate-300'}>
          &gt; {aiLog}
        </p>
      </div>

      {/* Interactive Player Hand Drawer */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold tracking-wide text-slate-400">Tactical Command Hand</h3>
          <button 
            onClick={handleEndTurn}
            disabled={turnOwner !== 'player-turn'}
            className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wide transition-all duration-200 border
                ${turnOwner === 'player-turn' ? 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700 cursor-pointer shadow-md'
                    : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-40' } `}
                >
                End Processing Turn
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hand.length > 0 ? (
              hand.map(card => (
                <GameCard
                  key={card.id}
                  card={card}
                  onPlay={handlePlayCard}
                  canAfford={turnOwner === 'player-turn' && !gameOver && playerEnergy >= card.cost}
                />
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-500 text-sm text-center">
                Tactical command hand empty. End Processing Turn to reload your deck.
              </div>
            )}
          </div>

          {gameOver && (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-950/40 p-4 text-center text-sm text-rose-200">
              {gameResult === 'victory'
                ? 'Victory achieved. The enemy engine has been neutralized.'
                : gameResult === 'deckout'
                  ? 'Deck-out! You could not draw a card and lost the duel.'
                  : 'Mission failure. Your core has been destroyed.'}
            </div>
          )}

          {gameOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
              <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
                <h2 className="text-3xl font-black text-emerald-300 mb-3">
                  {gameResult === 'victory' ? 'Victory' : gameResult === 'deckout' ? 'Deck-Out Defeat' : 'Defeat'}
                </h2>
                <p className="text-sm text-slate-300 mb-6">
                  {gameResult === 'victory'
                    ? 'You defeated the enemy and won the duel.'
                    : gameResult === 'deckout'
                      ? 'You have no cards left to draw and lose by deck-out.'
                      : 'Your core was destroyed. Reset and try again.'}
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
                >
                  Restart Duel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
