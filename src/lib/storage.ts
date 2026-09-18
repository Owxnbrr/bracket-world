import { resolveBracket } from './bracket';
import type { Prediction, Predictions } from '../types/bracket';

export const STORAGE_KEY = 'rlcs-playoffs-predictions';

export function parsePredictions(raw: string | null): Predictions {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('predictions' in data)) return {};
    const entries = data.predictions;
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return {};
    const predictions: Record<string, Prediction> = {};
    for (const [id, value] of Object.entries(entries)) {
      if (value && typeof value === 'object' && 'winnerId' in value && typeof value.winnerId === 'string') {
        predictions[id] = { winnerId: value.winnerId };
      }
    }
    return resolveBracket(predictions).predictions;
  } catch {
    return {};
  }
}

export function serializePredictions(predictions: Predictions): string {
  return JSON.stringify({ version: 1, predictions });
}
