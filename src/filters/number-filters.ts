import { FilterFunction, registerFilter } from "../filter-registry";

const numberFilters: Record<string, FilterFunction> = {
  round: (v, ...args) => {
    const decimals = Number(args[0]) || 0;
    const num = Number(v);
    return isNaN(num) ? 0 : Number(num.toFixed(decimals));
  },

  ceil: (v) => {
    const num = Number(v);
    return isNaN(num) ? 0 : Math.ceil(num);
  },

  floor: (v) => {
    const num = Number(v);
    return isNaN(num) ? 0 : Math.floor(num);
  },

  abs: (v) => {
    const num = Number(v);
    return isNaN(num) ? 0 : Math.abs(num);
  },

  currency: (v, ...args) => {
    const currency = args[0] || "EUR";
    const num = Number(v);

    if (isNaN(num)) return "0,00 €";

    // Format number manually for consistent output
    const formatted = num
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      .replace(".", ",");

    const symbols = {
      EUR: "€",
      USD: "$",
      GBP: "£",
    };

    const symbol = symbols[currency as keyof typeof symbols] || currency;
    return `${formatted} ${symbol}`;
  },

  percentage: (v, ...args) => {
    const decimals = Number(args[0]) || 0;
    const num = Number(v);

    if (isNaN(num)) return "0%";

    return `${(num * 100).toFixed(decimals)}%`;
  },

  add: (v, ...args) => {
    const addend = Number(args[0]) || 0;
    const num = Number(v);
    if (isNaN(num)) return addend;
    const result = num + addend;
    return Math.round(result * 10000) / 10000;
  },

  subtract: (v, ...args) => {
    const subtrahend = Number(args[0]) || 0;
    const num = Number(v);
    return isNaN(num) ? -subtrahend : num - subtrahend;
  },

  multiply: (v, ...args) => {
    const multiplier = Number(args[0]) || 1;
    const num = Number(v);
    if (isNaN(num)) return 0;
    const result = num * multiplier;
    return Math.round(result * 10000) / 10000;
  },

  divide: (v, ...args) => {
    const divisor = Number(args[0]) || 1;
    const num = Number(v);

    if (isNaN(num) || divisor === 0) return 0;
    return num / divisor;
  },

  min: (v, ...args) => {
    const compareValue = Number(args[0]);
    const num = Number(v);

    if (isNaN(num)) return compareValue || 0;
    if (isNaN(compareValue)) return num;

    return Math.min(num, compareValue);
  },

  max: (v, ...args) => {
    const compareValue = Number(args[0]);
    const num = Number(v);

    if (isNaN(num)) return compareValue || 0;
    if (isNaN(compareValue)) return num;

    return Math.max(num, compareValue);
  },
};

export function registerNumberFilters(): void {
  Object.entries(numberFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { numberFilters };
