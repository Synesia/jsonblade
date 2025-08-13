import { DataStructure } from "./types";
import { MAX_ANALYSIS_DEPTH } from "./constants";

export function analyzeDataStructure(
  obj: any,
  maxDepth = MAX_ANALYSIS_DEPTH,
  currentDepth = 0
): DataStructure {
  if (!obj || currentDepth > maxDepth) {
    return { type: typeof obj };
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return { type: "array", items: { type: "unknown" } };
    }

    const firstItem = analyzeDataStructure(obj[0], maxDepth, currentDepth + 1);

    if (firstItem.type === "object") {
      const mergedStructure: any = { ...firstItem };
      for (let i = 1; i < Math.min(obj.length, 5); i++) {
        const itemStructure = analyzeDataStructure(
          obj[i],
          maxDepth,
          currentDepth + 1
        );
        Object.assign(mergedStructure, itemStructure);
      }
      return { type: "array", items: mergedStructure };
    }

    return { type: "array", items: firstItem };
  }

  if (typeof obj === "object") {
    const structure: DataStructure = { type: "object" };
    for (const [key, value] of Object.entries(obj)) {
      structure[key] = analyzeDataStructure(value, maxDepth, currentDepth + 1);
    }
    return structure;
  }

  return { type: typeof obj, value: obj };
}

export function getPropertiesForPath(
  path: string,
  dataSchema: DataStructure
): string[] {
  console.log("Getting properties for path:", path);
  const parts = path.split(".");
  let current: any = dataSchema;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
      console.log(`After part '${part}':`, current);

      if (current && current.type === "array" && current.items) {
        current = current.items;
        console.log(`Array items:`, current);
      }
    } else {
      console.log(`Part '${part}' not found in:`, current);
      return [];
    }
  }

  if (current && typeof current === "object") {
    const properties = Object.keys(current).filter(
      (key) => key !== "type" && key !== "items" && key !== "value"
    );
    console.log("Found properties:", properties);
    return properties;
  }

  console.log("No properties found for:", path);
  return [];
}

export function validatePath(path: string, dataSchema: DataStructure): boolean {
  const parts = path.split(".");
  let current: any = dataSchema;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
      if (current && current.type === "array" && current.items) {
        current = current.items;
      }
    } else {
      return false;
    }
  }

  return true;
}
