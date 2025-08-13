import { FilterFunction, registerFilter } from "../filter-registry";

const validationFilters: Record<string, FilterFunction> = {
  isEmail: (v) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(v));
  },

  isURL: (v) => {
    try {
      new URL(String(v));
      return true;
    } catch {
      return false;
    }
  },

  isUUID: (v) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(String(v));
  },

  isNumber: (v) => {
    return !isNaN(Number(v)) && isFinite(Number(v));
  },

  isInteger: (v) => {
    const num = Number(v);
    return !isNaN(num) && Number.isInteger(num);
  },

  isPhoneNumber: (v) => {
    const phoneRegex = /^(\+33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(String(v).replace(/\s/g, ""));
  },

  minLength: (v, ...args) => {
    const minLen = Number(args[0]) || 0;
    return String(v).length >= minLen;
  },

  maxLength: (v, ...args) => {
    const maxLen = Number(args[0]) || Infinity;
    return String(v).length <= maxLen;
  },

  matches: (v, ...args) => {
    const pattern = args[0];
    if (!pattern) return false;

    try {
      const regex = new RegExp(pattern);
      return regex.test(String(v));
    } catch {
      return false;
    }
  },

  base64Encode: (v) => {
    try {
      return Buffer.from(String(v), "utf8").toString("base64");
    } catch {
      return "";
    }
  },

  base64Decode: (v) => {
    try {
      return Buffer.from(String(v), "base64").toString("utf8");
    } catch {
      return "";
    }
  },

  escape: (v) => {
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  },

  unescape: (v) => {
    return String(v)
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  },

  urlEncode: (v) => {
    return encodeURIComponent(String(v));
  },

  urlDecode: (v) => {
    try {
      return decodeURIComponent(String(v));
    } catch {
      return String(v);
    }
  },

  md5: (v) => {
    return `md5(${String(v)})`;
  },

  sha256: (v) => {
    return `sha256(${String(v)})`;
  },
};

export function registerValidationFilters(): void {
  Object.entries(validationFilters).forEach(([name, fn]) => {
    registerFilter(name, fn);
  });
}

export { validationFilters };
