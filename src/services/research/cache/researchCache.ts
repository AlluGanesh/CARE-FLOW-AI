// Lightweight Research Cache & Deduplication - Phase 2
import { Evidence, ResearchClaim, ResearchSource } from '../../../types/research';

export interface CachedEntityResearch {
  entityName: string;
  sources: ResearchSource[];
  evidence: Evidence[];
  claims: ResearchClaim[];
  cachedAt: number; // Epoch timestamp
}

export class ResearchCache {
  private static CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24-hour freshness TTL (Rule 34 & 35)
  private cache = new Map<string, CachedEntityResearch>();

  public get(entityName: string): CachedEntityResearch | null {
    const key = entityName.toLowerCase().trim();
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check freshness
    const now = Date.now();
    if (now - entry.cachedAt > ResearchCache.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  public set(
    entityName: string,
    sources: ResearchSource[],
    evidence: Evidence[],
    claims: ResearchClaim[]
  ): void {
    const key = entityName.toLowerCase().trim();
    this.cache.set(key, {
      entityName,
      sources,
      evidence,
      claims,
      cachedAt: Date.now()
    });
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
