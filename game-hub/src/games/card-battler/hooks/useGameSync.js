import { useEffect, useRef } from 'react';
import { supabase } from '@/games/card-battler/lib/supabaseClient';

/**
 * Subscribes to Supabase realtime updates for a specific game row and
 * dispatches SYNC_FROM_SERVER when a newer authoritative snapshot arrives.
 *
 * @param {string|number|null} gameId
 * @param {Function} localDispatch
 * @param {React.MutableRefObject<number>} versionRef - tracks latest applied state version
 * @param {(initialized: boolean) => void} [onRemoteUpdate] - optional side-effect when state arrives
 */
export function useGameSync(gameId, localDispatch, versionRef, onRemoteUpdate) {
  const dispatchRef = useRef(localDispatch);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);

  useEffect(() => { dispatchRef.current = localDispatch; }, [localDispatch]);
  useEffect(() => { onRemoteUpdateRef.current = onRemoteUpdate; }, [onRemoteUpdate]);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const incoming = payload.new?.status;
          if (!incoming || typeof incoming !== 'object') return;

          const incomingVersion =
            payload.new?.state_version ??
            incoming.stateVersion ??
            0;

          if (incomingVersion <= (versionRef.current ?? 0)) return;

          versionRef.current = incomingVersion;
          dispatchRef.current({ type: 'SYNC_FROM_SERVER', payload: incoming });

          const initialized =
            Array.isArray(incoming.player_1?.hand) &&
            incoming.player_1.hand.length > 0;

          onRemoteUpdateRef.current?.(initialized);
        }
      )
      .subscribe((status, err) => {
        if (err) console.error(`useGameSync: subscription error for game ${gameId}`, err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, versionRef]);
}
