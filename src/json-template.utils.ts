import { getFilter } from "./filter-registry";
import { registerStringFilters } from "./filters/string-filters";
import { registerArrayFilters } from "./filters/array-filters";
import { registerObjectFilters } from "./filters/object-filters";
import { registerLogicFilters } from "./filters/logic-filters";
import { registerDateFilters } from "./filters/date-filters";
import { registerNumberFilters } from "./filters/number-filters";
import { registerValidationFilters } from "./filters/validation-filters";
import {
  getTemplateConfig,
  handleTemplateError,
  createTemplateError,
} from "./template-config";

let filtersInitialized = false;

export function initializeFilters(): void {
  if (filtersInitialized) return;

  registerStringFilters();
  registerArrayFilters();
  registerObjectFilters();
  registerLogicFilters();
  registerDateFilters();
  registerNumberFilters();
  registerValidationFilters();

  filtersInitialized = true;
}

export function compileJSONTemplate(template: string, data: any): string {
  initializeFilters();
  const stringInterpolated = template.replace(
    /"([^"]*)"/g,
    (match, content) => {
      if (!content.includes("{{")) {
        return match;
      }

      const interpolated = content.replace(
        /{{\s*([^}]+)\s*}}/g,
        (_: string, expr: string) => {
          const value = evaluateExpression(expr.trim(), data);
          return value == null ? "" : String(value);
        }
      );

      return `"${interpolated}"`;
    }
  );

  const fullyInterpolated = stringInterpolated.replace(
    /{{\s*([^}]+)\s*}}/g,
    (_: string, expr: string) => {
      const value = evaluateExpression(expr.trim(), data);
      return JSON.stringify(value ?? null);
    }
  );

  return fullyInterpolated;
}

export function evaluateExpression(expr: string, data: any): any {
  const parts = expr.split("|").map((p) => p.trim());
  const [rawPath, ...filterParts] = parts;
  let value = getObjectPath(rawPath, data);

  for (const part of filterParts) {
    const match = part.match(/^(\w+)(?:\((.*?)\))?$/);
    if (!match) continue;

    const [, name, argsString] = match;
    const fn = getFilter(name);
    if (!fn) {
      const config = getTemplateConfig();
      const error = createTemplateError(
        "UNKNOWN_FILTER",
        `Unknown filter: ${name}`,
        { filter: name, expression: expr }
      );
      handleTemplateError(error, config);
      continue;
    }

    let args: any[] = [];
    if (argsString) {
      args = argsString.split(",").map((arg) => {
        const trimmed = arg.trim();
        if (
          (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith("'") && trimmed.endsWith("'"))
        ) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
    }

    value = fn(value, ...args);
  }

  return value;
}

export function getObjectPath(path: string, data: any): any {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = current[part];
  }
  return current;
}
