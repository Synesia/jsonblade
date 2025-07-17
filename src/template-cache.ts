interface CacheEntry {
  compiledFunction: (data: any) => string;
  lastUsed: number;
  useCount: number;
}

class TemplateCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(template: string): CacheEntry | undefined {
    const entry = this.cache.get(template);

    if (!entry) return undefined;

    // Check if entry is expired
    if (Date.now() - entry.lastUsed > this.ttl) {
      this.cache.delete(template);
      return undefined;
    }

    // Update last used time and use count
    entry.lastUsed = Date.now();
    entry.useCount++;

    return entry;
  }

  set(template: string, compiledFunction: (data: any) => string): void {
    // Remove least recently used entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(template, {
      compiledFunction,
      lastUsed: Date.now(),
      useCount: 1,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    const totalUses = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.useCount,
      0
    );

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalUses > 0 ? this.cache.size / totalUses : 0,
    };
  }

  private evictLRU(): void {
    let oldestEntry: [string, CacheEntry] | null = null;

    for (const entry of this.cache.entries()) {
      if (!oldestEntry || entry[1].lastUsed < oldestEntry[1].lastUsed) {
        oldestEntry = entry;
      }
    }

    if (oldestEntry) {
      this.cache.delete(oldestEntry[0]);
    }
  }
}

export const templateCache = new TemplateCache();

export function getCachedTemplate(
  template: string
): ((data: any) => string) | undefined {
  const entry = templateCache.get(template);
  return entry?.compiledFunction;
}

export function setCachedTemplate(
  template: string,
  compiledFunction: (data: any) => string
): void {
  templateCache.set(template, compiledFunction);
}

export function clearTemplateCache(): void {
  templateCache.clear();
}

export function getTemplateStats() {
  return templateCache.getStats();
}
