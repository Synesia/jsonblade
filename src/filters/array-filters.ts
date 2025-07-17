import { FilterFunction, registerFilter } from "../filter-registry";

const arrayFilters: Record<string, FilterFunction> = {
  join: (v, ...args) => {
    const separator = args[0] || ",";
    return Array.isArray(v) ? v.join(separator) : String(v);
  },
  length: (v) => {
    if (Array.isArray(v) || typeof v === "string") return v.length;
    if (v && typeof v === "object") return Object.keys(v).length;
    return 0;
  },
  first: (v) => {
    if (Array.isArray(v)) return v[0];
    if (typeof v === "string") return v.charAt(0);
    return null;
  },
  last: (v) => {
    if (Array.isArray(v)) return v[v.length - 1];
    if (typeof v === "string") return v.charAt(v.length - 1);
    return null;
  },
  map: (v, ...args) => {
    if (!Array.isArray(v)) return v;
    const prop = args[0];
    return v.map((item) => {
      if (item && typeof item === "object" && prop) {
        return item[prop];
      }
      return item;
    });
  },
  filter: (v, ...args) => {
    if (!Array.isArray(v)) return v;
    const [prop, val] = args;
    if (!prop) return v;
    return v.filter((item) => {
      if (item && typeof item === "object") {
        const itemVal = item[prop];

        // Handle boolean comparisons
        if (val === "true") return itemVal === true;
        if (val === "false") return itemVal === false;
        if (val === true) return itemVal === true;
        if (val === false) return itemVal === false;

        // Handle numeric comparisons
        if (!isNaN(Number(val)) && !isNaN(Number(itemVal))) {
          return Number(itemVal) === Number(val);
        }

        // Handle direct equality
        return itemVal === val;
      }
      return item === prop;
    });
  },
  reverse: (v) => {
    if (Array.isArray(v)) return [...v].reverse();
    if (typeof v === "string") return v.split("").reverse().join("");
    return v;
  },
  sort: (v, ...args) => {
    if (!Array.isArray(v)) return v;
    const prop = args[0];
    const sortedArray = [...v];

    if (prop) {
      return sortedArray.sort((a, b) => {
        const aVal = a && typeof a === "object" ? a[prop] : a;
        const bVal = b && typeof b === "object" ? b[prop] : b;
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    return sortedArray.sort();
  },
  unique: (v) => {
    if (!Array.isArray(v)) return v;
    return [...new Set(v)];
  },
};

export function registerArrayFilters(): void {
  Object.entries(arrayFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { arrayFilters };
