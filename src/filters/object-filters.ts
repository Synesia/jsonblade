import { FilterFunction, registerFilter } from "../filter-registry";

const objectFilters: Record<string, FilterFunction> = {
  json: (v) => JSON.stringify(v),
  keys: (v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.keys(v);
    }
    return [];
  },
  values: (v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.values(v);
    }
    return [];
  },
  get: (v, ...args) => {
    const key = args[0];
    if (v && typeof v === "object" && key) {
      return v[key];
    }
    return null;
  },
  has: (v, ...args) => {
    const key = args[0];
    if (v && typeof v === "object" && key) {
      return key in v;
    }
    return false;
  },
  entries: (v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.entries(v);
    }
    return [];
  },
};

export function registerObjectFilters(): void {
  Object.entries(objectFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { objectFilters };
