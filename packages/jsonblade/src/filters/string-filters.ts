import { FilterFunction, registerFilter } from "../filter-registry";

const stringFilters: Record<string, FilterFunction> = {
  upper: (v) => {
    if (v == null) return v;
    return String(v).toUpperCase();
  },
  lower: (v) => {
    if (v == null) return v;
    return String(v).toLowerCase();
  },
  capitalize: (v) => {
    if (v == null) return v;
    const s = String(v);
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  trim: (v) => {
    if (v == null) return v;
    return String(v).trim();
  },
  default: (v, ...args) => {
    const defaultValue = args[0];
    if (v === null || v === undefined || v === "") {
      return defaultValue !== undefined ? defaultValue : "";
    }
    return v;
  },
  slug: (v) => {
    if (v == null) return v;
    return String(v)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },
};

export function registerStringFilters(): void {
  Object.entries(stringFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { stringFilters };
