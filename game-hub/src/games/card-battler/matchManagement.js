// BUG FIX: Original was a bare script with no imports, no exports, and referenced
// `supabase`, `activeMatchId`, `opponentId`, `myPlayerId`, `updateGameUI`, and
// `triggerDisconnectTimer` as globals — none of which exist in module scope.
// This version wraps the logic in a proper function with explicit parameters.

import { supabase } from '@/games/card-battler/lib/supabaseClient';

/**
 * Creates and subscribes to a private realtime channel for an active match.
 * Returns a cleanup function that removes the channel on teardown.
 *
 * @param {{
 *   activeMatchId: string,
 *   myPlayerId: string,
 *   opponentId: string,
 *   onStateSync: (boardState: any, currentTurn: any) => void,
 *   onOpponentDisconnect: () => void,
 * }} options
 * @returns {() => void} cleanup
 */
export function subscribeToMatch({
  activeMatchId,
  myPlayerId,
  opponentId,
  onStateSync,
  onOpponentDisconnect,
}) {
  const matchChannel = supabase.channel(`match:${activeMatchId}`, {
    config: {
      // Authorizes this connection against Supabase RLS rules.
      private: true,
    },
  });

  matchChannel
    // A. Receive authoritative state refreshes from the Edge Function.
    .on('broadcast', { event: 'state-sync' }, ({ payload }) => {
      onStateSync(payload.boardState, payload.currentTurn);
    })

    // B. Detect when the opponent's socket disconnects.
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      const opponentLeft = leftPresences.some((p) => p.user_id === opponentId);
      if (opponentLeft) {
        console.warn('Opponent disconnected:', leftPresences);
        onOpponentDisconnect();
      }
    })

    // C. Track our own presence so the opponent can detect our connection.
    .subscribe(async (status, err) => {
      if (err) {
        console.error('matchChannel subscribe error:', err);
        return;
      }
      if (status === 'SUBSCRIBED') {
        await matchChannel.track({ user_id: myPlayerId, status: 'online' });
      }
    });

  // Return a cleanup function for use in useEffect teardowns.
  return () => {
    supabase.removeChannel(matchChannel);
  };
}
