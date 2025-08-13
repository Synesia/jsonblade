import { FilterFunction, registerFilter } from "../filter-registry";

const dateFilters: Record<string, FilterFunction> = {
  formatDate: (v, ...args) => {
    const format = args[0] || "YYYY-MM-DD";
    const date = parseDate(v);

    if (isNaN(date.getTime())) return "Invalid Date";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return format
      .replace(/YYYY/g, String(year))
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds);
  },

  fromNow: (v) => {
    const date = parseDate(v);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (isNaN(date.getTime())) return "Invalid Date";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    return "just now";
  },

  addDays: (v, ...args) => {
    const days = Number(args[0]) || 0;
    const date = parseDate(v);

    if (isNaN(date.getTime())) return "Invalid Date";

    date.setDate(date.getDate() + days);
    return date.toISOString();
  },

  isoDate: (v) => {
    const date = parseDate(v);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toISOString();
  },

  timestamp: (v) => {
    const date = parseDate(v);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  },
};

// Helper function to parse various date formats
function parseDate(v: any): Date {
  if (v instanceof Date) return v;

  const str = String(v);

  // Try DD/MM/YYYY format - create as UTC to avoid timezone issues
  const ddmmyyyy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))
    );
  }

  // Try default Date parsing
  return new Date(v);
}

export function registerDateFilters(): void {
  Object.entries(dateFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { dateFilters };
