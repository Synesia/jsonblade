import { getFilter, FilterFunction } from "./filter-registry";
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
  // Keep only for backward compatibility with global registry usage
  registerStringFilters();
  registerArrayFilters();
  registerObjectFilters();
  registerLogicFilters();
  registerDateFilters();
  registerNumberFilters();
  registerValidationFilters();
  filtersInitialized = true;
}

export interface TemplateFunction {
  name: string;
  func: (...args: any[]) => any;
}

export function getObjectPath(path: string, obj: any): any {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null) return null;
    if (typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return null;
    }
  }

  return result;
}

// Helper function for async string replacement
async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (match: string, ...args: any[]) => Promise<string>
): Promise<string> {
  const promises: Promise<{
    index: number;
    match: string;
    replacement: string;
  }>[] = [];
  let match;

  while ((match = regex.exec(str)) !== null) {
    const index = match.index;
    const fullMatch = match[0];
    promises.push(
      asyncFn(fullMatch, ...match.slice(1)).then((replacement) => ({
        index,
        match: fullMatch,
        replacement,
      }))
    );
  }

  const replacements = await Promise.all(promises);
  replacements.sort((a, b) => b.index - a.index);

  let result = str;
  for (const { index, match, replacement } of replacements) {
    result =
      result.substring(0, index) +
      replacement +
      result.substring(index + match.length);
  }

  return result;
}

// Process comments {{!-- ... --}}
function processComments(template: string): string {
  return template.replace(/\{\{!--.*?--\}\}/gs, "");
}

// Evaluate conditions for if statements
function evaluateCondition(
  condition: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): boolean {
  try {
    const result = evaluateExpression(
      condition,
      data,
      functions,
      filterResolver
    );
    if (typeof result === "boolean") return result;
    if (typeof result === "number") return result !== 0;
    if (typeof result === "string") return result.length > 0;
    if (Array.isArray(result)) return result.length > 0;
    return result != null;
  } catch {
    return false;
  }
}

// Process {{#if condition}} ... {{/if}} blocks
function processConditionals(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): string {
  const conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;

  return template.replace(conditionalRegex, (match, condition, content) => {
    const result = evaluateCondition(
      condition.trim(),
      data,
      functions,
      filterResolver
    );
    return result ? content : "";
  });
}
async function processConditionalsAsync(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<string> {
  const conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;
  return replaceAsync(
    template,
    conditionalRegex,
    async (_m: string, condition: string, content: string) => {
      const res = await (async () => {
        try {
          const v = await evaluateExpressionAsync(
            condition.trim(),
            data,
            functions,
            filterResolver
          );
          if (typeof v === "boolean") return v;
          if (typeof v === "number") return v !== 0;
          if (typeof v === "string") return v.length > 0;
          if (Array.isArray(v)) return v.length > 0;
          return v != null;
        } catch {
          return false;
        }
      })();
      return res ? content : "";
    }
  );
}

// Process {{#if condition}} ... {{#else}} ... {{/if}} blocks
function processIfElse(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): string {
  const ifElseRegex =
    /\{\{#if\s+([^}]+)\}\}(.*?)\{\{#else\}\}(.*?)\{\{\/if\}\}/gs;

  return template.replace(
    ifElseRegex,
    (match, condition, ifContent, elseContent) => {
      const result = evaluateCondition(
        condition.trim(),
        data,
        functions,
        filterResolver
      );
      return result ? ifContent : elseContent;
    }
  );
}
async function processIfElseAsync(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<string> {
  const ifElseRegex =
    /\{\{#if\s+([^}]+)\}\}(.*?)\{\{#else\}\}(.*?)\{\{\/if\}\}/gs;
  return replaceAsync(
    template,
    ifElseRegex,
    async (
      _m: string,
      condition: string,
      ifContent: string,
      elseContent: string
    ) => {
      const ok = await (async () => {
        try {
          const v = await evaluateExpressionAsync(
            condition.trim(),
            data,
            functions,
            filterResolver
          );
          if (typeof v === "boolean") return v;
          if (typeof v === "number") return v !== 0;
          if (typeof v === "string") return v.length > 0;
          if (Array.isArray(v)) return v.length > 0;
          return v != null;
        } catch {
          return false;
        }
      })();
      return ok ? ifContent : elseContent;
    }
  );
}

// Process {{#unless condition}} ... {{/unless}} blocks
function processUnless(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): string {
  const unlessRegex = /\{\{#unless\s+([^}]+)\}\}(.*?)\{\{\/unless\}\}/gs;

  return template.replace(unlessRegex, (match, condition, content) => {
    const result = evaluateCondition(
      condition.trim(),
      data,
      functions,
      filterResolver
    );
    return result ? "" : content;
  });
}
async function processUnlessAsync(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<string> {
  const unlessRegex = /\{\{#unless\s+([^}]+)\}\}(.*?)\{\{\/unless\}\}/gs;
  return replaceAsync(
    template,
    unlessRegex,
    async (_m: string, condition: string, content: string) => {
      const ok = await (async () => {
        try {
          const v = await evaluateExpressionAsync(
            condition.trim(),
            data,
            functions,
            filterResolver
          );
          if (typeof v === "boolean") return v;
          if (typeof v === "number") return v !== 0;
          if (typeof v === "string") return v.length > 0;
          if (Array.isArray(v)) return v.length > 0;
          return v != null;
        } catch {
          return false;
        }
      })();
      return ok ? "" : content;
    }
  );
}

// Process loops {{#each items}} ... {{/each}}
function processLoops(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): string {
  const loopRegex = /\{\{#each\s+([^}]+)\}\}(.*?)\{\{\/each\}\}/gs;

  return template.replace(loopRegex, (match, arrayPath, content) => {
    const array = getObjectPath(arrayPath.trim(), data);

    if (!Array.isArray(array)) return "";

    return array
      .map((item, index) => {
        let itemContent = content;

        // Replace {{this}} with current item
        itemContent = itemContent.replace(
          /\{\{this\}\}/g,
          typeof item === "string" ? item : JSON.stringify(item)
        );

        // Handle {{this | filters...}} expressions
        itemContent = itemContent.replace(
          /\{\{this(\s*\|[^}]+)\}\}/g,
          (match: string, filterPart: string) => {
            const result = evaluateExpression(
              `this${filterPart}`,
              { this: item },
              functions,
              filterResolver
            );
            return typeof result === "string" ? result : JSON.stringify(result);
          }
        );

        // Add loop variables
        const loopData = {
          ...data,
          "@index": index,
          "@first": index === 0,
          "@last": index === array.length - 1,
          ...(item && typeof item === "object" ? item : {}),
        };

        // Process nested conditions and filters within the loop
        itemContent = processIfElse(
          itemContent,
          loopData,
          functions,
          filterResolver
        );
        itemContent = processConditionals(
          itemContent,
          loopData,
          functions,
          filterResolver
        );
        itemContent = processUnless(
          itemContent,
          loopData,
          functions,
          filterResolver
        );

        // Interpolate strings inside quotes first (same logic as global phase)
        itemContent = itemContent.replace(
          /"([^"]*)"/g,
          (match: string, content: string) => {
            if (!content.includes("{{")) {
              return match;
            }

            const interpolated = content.replace(
              /{{\s*([^}]+)\s*}}/g,
              (_: string, expr: string) => {
                const value = evaluateExpression(
                  expr.trim(),
                  loopData,
                  functions,
                  filterResolver
                );
                if (value == null) return "";
                const stringValue = String(value);
                return stringValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
              }
            );

            return `"${interpolated}"`;
          }
        );

        // Then interpolate direct expressions into JSON (same logic as global phase)
        itemContent = itemContent.replace(
          /{{\s*([^}]+)\s*}}/g,
          (_: string, expr: string) => {
            const value = evaluateExpression(
              expr.trim(),
              loopData,
              functions,
              filterResolver
            );
            return JSON.stringify(value ?? null);
          }
        );

        return itemContent;
      })
      .join("");
  });
}
async function processLoopsAsync(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<string> {
  const loopRegex = /\{\{#each\s+([^}]+)\}\}(.*?)\{\{\/each\}\}/gs;
  let result = template;
  let match: RegExpExecArray | null;
  while ((match = loopRegex.exec(template)) !== null) {
    const [full, arrayPath, block] = match;
    const array = getObjectPath(arrayPath.trim(), data);
    let rendered = "";
    if (Array.isArray(array)) {
      const parts: string[] = [];
      for (let index = 0; index < array.length; index++) {
        const item = array[index];
        let itemContent = block;
        itemContent = itemContent.replace(
          /\{\{this\}\}/g,
          typeof item === "string" ? item : JSON.stringify(item)
        );
        itemContent = itemContent.replace(
          /\{\{this(\s*\|[^}]+)\}\}/g,
          (_m: string, filterPart: string) => {
            const r = evaluateExpression(
              `this${filterPart}`,
              { this: item },
              functions,
              filterResolver
            );
            return typeof r === "string" ? r : JSON.stringify(r);
          }
        );
        const loopData = {
          ...data,
          "@index": index,
          "@first": index === 0,
          "@last": index === array.length - 1,
          ...item,
        };
        itemContent = await processIfElseAsync(
          itemContent,
          loopData,
          functions,
          filterResolver
        );
        itemContent = await processConditionalsAsync(
          itemContent,
          loopData,
          functions,
          filterResolver
        );
        itemContent = await processUnlessAsync(
          itemContent,
          loopData,
          functions,
          filterResolver
        );
        itemContent = await replaceAsync(
          itemContent,
          /"([^"]*)"/g,
          async (_m: string, content: string) => {
            if (!content.includes("{{")) return `"${content}"`;
            const interpolated = await replaceAsync(
              content,
              /\{\{\s*([^}]+)\s*\}\}/g,
              async (_: string, expr: string) => {
                const v = await evaluateExpressionAsync(
                  expr.trim(),
                  loopData,
                  functions,
                  filterResolver
                );
                if (v == null) return "";
                const s = String(v);
                return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
              }
            );
            return `"${interpolated}"`;
          }
        );
        itemContent = await replaceAsync(
          itemContent,
          /\{\{\s*([^}]+)\s*\}\}/g,
          async (_: string, expr: string) => {
            const v = await evaluateExpressionAsync(
              expr.trim(),
              loopData,
              functions,
              filterResolver
            );
            return JSON.stringify(v ?? null);
          }
        );
        parts.push(itemContent);
      }
      rendered = parts.join("");
    }
    result = result.replace(full, rendered);
  }
  return result;
}

// Extract and process variables {{#set varName = expression}}
function extractVariables(
  template: string,
  data: any,
  functions?: TemplateFunction[]
): Record<string, any> {
  const variables: Record<string, any> = {};
  const setRegex = /\{\{#set\s+(\w+)\s*=\s*([^}]+)\}\}/g;

  let match;
  while ((match = setRegex.exec(template)) !== null) {
    const [, varName, expression] = match;
    const result = evaluateExpression(
      expression.trim(),
      { ...data, ...variables },
      functions
    );
    variables[varName] = result;
  }

  return variables;
}
async function extractVariablesAsync(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<Record<string, any>> {
  const variables: Record<string, any> = {};
  const setRegex = /\{\{#set\s+(\w+)\s*=\s*([^}]+)\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = setRegex.exec(template)) !== null) {
    const [, varName, expression] = match;
    const result = await evaluateExpressionAsync(
      expression.trim(),
      { ...data, ...variables },
      functions,
      filterResolver
    );
    variables[varName] = result;
  }
  return variables;
}

// Replace variables and remove {{#set}} declarations
function replaceVariables(
  template: string,
  variables: Record<string, any>
): string {
  // Remove set declarations
  let result = template.replace(/\{\{#set\s+(\w+)\s*=\s*([^}]+)\}\}/g, "");

  // Replace variable references
  Object.keys(variables).forEach((varName) => {
    const regex = new RegExp(`\\{\\{${varName}(?!\\.)\\}\\}`, "g");
    const value = variables[varName];
    result = result.replace(
      regex,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  });

  return result;
}

// Synchronous wrapper for backward compatibility with tests
export function compileJSONTemplate(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): any {
  // For synchronous operation, we use a simplified version that doesn't support async functions
  // but supports all the advanced features like conditions, loops, etc.

  initializeFilters();

  // Handle empty template
  if (!template || template.trim() === "") {
    return "";
  }

  let result = template;

  // Process in order:
  // 1. Remove comments
  result = processComments(result);

  // 2. Extract and process variables
  const variables = extractVariables(result, data, functions);
  const enrichedData = { ...data, ...variables };
  result = replaceVariables(result, variables);

  // 3. Process loops (handles conditionals within loops)
  result = processLoops(result, enrichedData, functions, filterResolver);

  // 4. Process conditionals at global level
  result = processIfElse(result, enrichedData, functions, filterResolver);
  result = processConditionals(result, enrichedData, functions, filterResolver);
  result = processUnless(result, enrichedData, functions, filterResolver);

  // 5. Process string interpolations
  const stringInterpolated = result.replace(/"([^"]*)"/g, (match, content) => {
    if (!content.includes("{{")) {
      return match;
    }

    const interpolated = content.replace(
      /{{\s*([^}]+)\s*}}/g,
      (_: string, expr: string) => {
        const value = evaluateExpression(
          expr.trim(),
          enrichedData,
          functions,
          filterResolver
        );
        if (value == null) return "";
        const stringValue = String(value);
        return stringValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      }
    );

    return `"${interpolated}"`;
  });

  // 6. Process direct interpolations
  const fullyInterpolated = stringInterpolated.replace(
    /{{\s*([^}]+)\s*}}/g,
    (_: string, expr: string) => {
      const value = evaluateExpression(
        expr.trim(),
        enrichedData,
        functions,
        filterResolver
      );
      return JSON.stringify(value ?? null);
    }
  );

  try {
    return JSON.parse(fullyInterpolated);
  } catch (e) {
    const config = getTemplateConfig();
    const error = createTemplateError(
      "INVALID_SYNTAX",
      "Invalid JSON after interpolation"
    );
    handleTemplateError(error, config);
    return null;
  }
}

// Async version for async functions
export async function compileJSONTemplateAsync(
  template: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<any> {
  initializeFilters();

  if (!template || template.trim() === "") {
    return "";
  }

  // 1. Remove comments (sync)
  let result = processComments(template);

  // 2. Extract variables (async) and replace
  const variables = await extractVariablesAsync(
    result,
    data,
    functions,
    filterResolver
  );
  const enrichedData = { ...data, ...variables };
  result = replaceVariables(result, variables);

  // 3. Loops and nested blocks (async)
  result = await processLoopsAsync(
    result,
    enrichedData,
    functions,
    filterResolver
  );

  // 4. Conditionals at global level (async)
  result = await processIfElseAsync(
    result,
    enrichedData,
    functions,
    filterResolver
  );
  result = await processConditionalsAsync(
    result,
    enrichedData,
    functions,
    filterResolver
  );
  result = await processUnlessAsync(
    result,
    enrichedData,
    functions,
    filterResolver
  );

  // 5. String interpolations inside quotes (async)
  const stringInterpolated = await replaceAsync(
    result,
    /"([^"]*)"/g,
    async (_match: string, content: string) => {
      if (!content.includes("{{")) return `"${content}"`;
      const interpolated = await replaceAsync(
        content,
        /{{\s*([^}]+)\s*}}/g,
        async (_: string, expr: string) => {
          const value = await evaluateExpressionAsync(
            expr.trim(),
            enrichedData,
            functions,
            filterResolver
          );
          if (value == null) return "";
          const stringValue = String(value);
          return stringValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        }
      );
      return `"${interpolated}"`;
    }
  );

  // 6. Direct interpolations to JSON (async)
  const fullyInterpolated = await replaceAsync(
    stringInterpolated,
    /{{\s*([^}]+)\s*}}/g,
    async (_: string, expr: string) => {
      const value = await evaluateExpressionAsync(
        expr.trim(),
        enrichedData,
        functions,
        filterResolver
      );
      return JSON.stringify(value ?? null);
    }
  );

  try {
    return JSON.parse(fullyInterpolated);
  } catch (e) {
    const config = getTemplateConfig();
    const error = createTemplateError(
      "INVALID_SYNTAX",
      "Invalid JSON after interpolation"
    );
    handleTemplateError(error, config);
    return null;
  }
}

export function evaluateExpression(
  expr: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): any {
  const parts = expr.split("|").map((p) => p.trim());
  const [rawPath, ...filterParts] = parts;

  // Détecter les appels de fonction dans rawPath
  const functionCallMatch = rawPath.match(/^(\w+)\((.*?)\)$/);

  let value;
  if (functionCallMatch) {
    // C'est un appel de fonction
    const [, functionName, argsString] = functionCallMatch;

    // Chercher la fonction dans le registre fourni
    const templateFunction = functions?.find((f) => f.name === functionName);

    if (templateFunction) {
      // Parser les arguments
      let args: any[] = [];
      if (argsString.trim()) {
        args = argsString.split(",").map((arg) => {
          const trimmed = arg.trim();
          if (
            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
          ) {
            return trimmed.slice(1, -1);
          }
          if (trimmed === "true") return true;
          if (trimmed === "false") return false;
          if (trimmed === "null") return null;
          // Try to parse as number
          if (!isNaN(Number(trimmed)) && trimmed !== "") {
            return Number(trimmed);
          }
          // Try to resolve as data path first, fallback to literal string
          const pathValue = getObjectPath(trimmed, data);
          return pathValue !== null && pathValue !== undefined
            ? pathValue
            : trimmed;
        });
      }

      // Appeler la fonction
      value = templateFunction.func(...args);
    } else {
      // Fonction introuvable, fallback vers getObjectPath
      value = getObjectPath(rawPath, data);
    }
  } else {
    // Path normal, utiliser getObjectPath
    value = getObjectPath(rawPath, data);
  }

  for (const part of filterParts) {
    const match = part.match(/^(\w+)(?:\((.*?)\))?$/);
    if (!match) continue;

    const [, name, argsString] = match;
    const fn = filterResolver
      ? (filterResolver(name) ?? getFilter(name))
      : getFilter(name);
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
        if (trimmed === "true") return true;
        if (trimmed === "false") return false;
        if (trimmed === "null") return null;
        // Try to resolve as data path first, fallback to literal string
        const pathValue = getObjectPath(trimmed, data);
        return pathValue !== null && pathValue !== undefined
          ? pathValue
          : trimmed;
      });
    }

    value = fn(value, ...args);
  }

  return value;
}

export async function evaluateExpressionAsync(
  expr: string,
  data: any,
  functions?: TemplateFunction[],
  filterResolver?: (name: string) => FilterFunction | undefined
): Promise<any> {
  const parts = expr.split("|").map((p) => p.trim());
  const [rawPath, ...filterParts] = parts;

  // Détecter les appels de fonction dans rawPath
  const functionCallMatch = rawPath.match(/^(\w+)\((.*?)\)$/);

  let value;
  if (functionCallMatch) {
    // C'est un appel de fonction
    const [, functionName, argsString] = functionCallMatch;

    // Chercher la fonction dans le registre fourni
    const templateFunction = functions?.find((f) => f.name === functionName);

    if (templateFunction) {
      // Parser les arguments
      let args: any[] = [];
      if (argsString.trim()) {
        args = argsString.split(",").map((arg) => {
          const trimmed = arg.trim();
          if (
            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
          ) {
            return trimmed.slice(1, -1);
          }
          // Try to parse as number
          if (!isNaN(Number(trimmed)) && trimmed !== "") {
            return Number(trimmed);
          }
          if (trimmed === "true") return true;
          if (trimmed === "false") return false;
          if (trimmed === "null") return null;
          // Try to resolve as data path first, fallback to literal string
          const pathValue = getObjectPath(trimmed, data);
          return pathValue !== null && pathValue !== undefined
            ? pathValue
            : trimmed;
        });
      }

      // Appeler la fonction (peut être async)
      value = await templateFunction.func(...args);
    } else {
      // Fonction introuvable, fallback vers getObjectPath
      value = getObjectPath(rawPath, data);
    }
  } else {
    // Path normal, utiliser getObjectPath
    value = getObjectPath(rawPath, data);
  }

  // Note: Les filtres ne sont pas async dans cette implémentation
  // Si besoin, il faudrait créer un système de filtres async séparé
  for (const part of filterParts) {
    const match = part.match(/^(\w+)(?:\((.*?)\))?$/);
    if (!match) continue;

    const [, name, argsString] = match;
    const fn = filterResolver
      ? (filterResolver(name) ?? getFilter(name))
      : getFilter(name);
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
        if (trimmed === "true") return true;
        if (trimmed === "false") return false;
        if (trimmed === "null") return null;
        // Try to resolve as data path first, fallback to literal string
        const pathValue = getObjectPath(trimmed, data);
        return pathValue !== null && pathValue !== undefined
          ? pathValue
          : trimmed;
      });
    }

    value = fn(value, ...args);
  }

  return value;
}
