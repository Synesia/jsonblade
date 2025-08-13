import { FilterFunction, registerFilter } from "../filter-registry";

const logicFilters: Record<string, FilterFunction> = {
  equals: (v, ...args) => {
    const val = args[0];
    const compareVal = !isNaN(Number(val)) ? Number(val) : val;
    return v === compareVal;
  },
  not: (v) => !v,
  bool: (v) => Boolean(v),
  gt: (v, ...args) => {
    const compareVal = Number(args[0]);
    return Number(v) > compareVal;
  },
  gte: (v, ...args) => {
    const compareVal = Number(args[0]);
    return Number(v) >= compareVal;
  },
  lt: (v, ...args) => {
    const compareVal = Number(args[0]);
    return Number(v) < compareVal;
  },
  lte: (v, ...args) => {
    const compareVal = Number(args[0]);
    return Number(v) <= compareVal;
  },
  contains: (v, ...args) => {
    const searchVal = args[0];
    if (typeof v === "string") {
      return v.includes(String(searchVal));
    }
    if (Array.isArray(v)) {
      return v.includes(searchVal);
    }
    return false;
  },
  startsWith: (v, ...args) => {
    const prefix = args[0];
    return String(v).startsWith(String(prefix));
  },
  endsWith: (v, ...args) => {
    const suffix = args[0];
    return String(v).endsWith(String(suffix));
  },
  isEmpty: (v) => {
    if (v == null) return true;
    if (typeof v === "string" || Array.isArray(v)) return v.length === 0;
    if (typeof v === "object") return Object.keys(v).length === 0;
    return false;
  },
};

export function registerLogicFilters(): void {
  Object.entries(logicFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { logicFilters };
