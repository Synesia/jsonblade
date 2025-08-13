type AsyncFilterFunction = (value: any, ...args: any[]) => Promise<any>;

class AsyncFilterRegistry {
  private asyncFilters: Record<string, AsyncFilterFunction> = {};

  registerAsyncFilter(name: string, fn: AsyncFilterFunction): void {
    this.asyncFilters[name] = fn;
  }

  getAsyncFilter(name: string): AsyncFilterFunction | undefined {
    return this.asyncFilters[name];
  }

  hasAsyncFilter(name: string): boolean {
    return name in this.asyncFilters;
  }

  getAllAsyncFilters(): Record<string, AsyncFilterFunction> {
    return { ...this.asyncFilters };
  }

  unregisterAsyncFilter(name: string): boolean {
    if (this.hasAsyncFilter(name)) {
      delete this.asyncFilters[name];
      return true;
    }
    return false;
  }

  registerAsyncFilters(filters: Record<string, AsyncFilterFunction>): void {
    Object.entries(filters).forEach(([name, fn]) => {
      this.registerAsyncFilter(name, fn);
    });
  }
}

export const asyncFilterRegistry = new AsyncFilterRegistry();
export { AsyncFilterFunction };

export function registerAsyncFilter(
  name: string,
  fn: AsyncFilterFunction
): void {
  asyncFilterRegistry.registerAsyncFilter(name, fn);
}

export function getAsyncFilter(name: string): AsyncFilterFunction | undefined {
  return asyncFilterRegistry.getAsyncFilter(name);
}

export function hasAsyncFilter(name: string): boolean {
  return asyncFilterRegistry.hasAsyncFilter(name);
}
