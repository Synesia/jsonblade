type FilterFunction = (value: any, ...args: any[]) => any;

class FilterRegistry {
  private filters: Record<string, FilterFunction> = {};

  registerFilter(name: string, fn: FilterFunction): void {
    this.filters[name] = fn;
  }

  getFilter(name: string): FilterFunction | undefined {
    return this.filters[name];
  }

  hasFilter(name: string): boolean {
    return name in this.filters;
  }

  getAllFilters(): Record<string, FilterFunction> {
    return { ...this.filters };
  }

  unregisterFilter(name: string): boolean {
    if (this.hasFilter(name)) {
      delete this.filters[name];
      return true;
    }
    return false;
  }

  registerFilters(filters: Record<string, FilterFunction>): void {
    Object.entries(filters).forEach(([name, fn]) => {
      this.registerFilter(name, fn);
    });
  }
}

export const filterRegistry = new FilterRegistry();
export { FilterFunction };

export function registerFilter(name: string, fn: FilterFunction): void {
  filterRegistry.registerFilter(name, fn);
}

export function getFilter(name: string): FilterFunction | undefined {
  return filterRegistry.getFilter(name);
}
