import { useEffect, useRef } from 'react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';

/**
 * Headless hook that manages the matchmaking flow.
 * Calls `onGameStart(gameId)` when a match is found.
 *
 * @param {boolean} isSearching
 * @param {string|number} userId
 * @param {(gameId: string) => void} onGameStart
 */
export function useMatchmaking(isSearching, userId, onGameStart) {
  const onGameStartRef = useRef(onGameStart);

  useEffect(() => {
    onGameStartRef.current = onGameStart;
  }, [onGameStart]);

  useEffect(() => {
    if (!isSearching) return;

    let isMounted = true;
    let subscription;

    const initMatchmaking = async () => {
      const { data, error } = await supabase.rpc('find_or_create_match', {
        p_game_type: 'card-battler',
      });

      if (!isMounted) return;

      if (error) {
        console.error('useMatchmaking RPC error:', error);
        return;
      }

      const match = Array.isArray(data) ? data[0] : data;

      if (match?.status === 'matched' && match.game_id) {
        onGameStartRef.current(match.game_id);
        return;
      }

      subscription = supabase
        .channel(`matchmaking-${userId}`)
        .on(
          'postgres_changes',
          {
            event:  'INSERT',
            schema: 'public',
            table:  'games',
          },
          (payload) => {
            if (!isMounted) return;

            const game = payload.new;
            if (
              String(game.player_1_id) === String(userId) ||
              String(game.player_2_id) === String(userId)
            ) {
              onGameStartRef.current(game.id);
            }
          }
        )
        .subscribe();
    };

    initMatchmaking();

    return () => {
      isMounted = false;
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [isSearching, userId]);
}
