import { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveBracket, selectWinner } from '../lib/bracket';
import { parsePredictions, serializePredictions, STORAGE_KEY } from '../lib/storage';
import type { Predictions } from '../types/bracket';

export function useBracketPredictions() {
  const [predictions, setPredictions] = useState<Predictions>(() => {
    try { return parsePredictions(window.localStorage.getItem(STORAGE_KEY)); }
    catch { return {}; }
  });
  const [storageAvailable, setStorageAvailable] = useState(true);
  const bracket = useMemo(() => resolveBracket(predictions), [predictions]);

  useEffect(() => {
    try {
      if (Object.keys(predictions).length) {
        window.localStorage.setItem(STORAGE_KEY, serializePredictions(predictions));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [predictions]);

  const pickWinner = useCallback((matchId: string, teamId: string) => {
    setPredictions((current) => selectWinner(current, matchId, teamId));
  }, []);

  const reset = useCallback(() => setPredictions({}), []);
  return { bracket, pickWinner, reset, storageAvailable, count: Object.keys(bracket.predictions).length };
}
