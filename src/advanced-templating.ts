import { getFilter } from "./filter-registry";

// Conditional templating
export function processConditionals(template: string, data: any): string {
  // Process {{#if condition}} ... {{/if}} blocks
  const conditionalRegex = /\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}/gs;

  return template.replace(conditionalRegex, (match, condition, content) => {
    const result = evaluateCondition(condition.trim(), data);
    return result ? content : "";
  });
}

// Process {{#if condition}} ... {{#else}} ... {{/if}} blocks
export function processIfElse(template: string, data: any): string {
  const ifElseRegex =
    /\{\{#if\s+([^}]+)\}\}(.*?)\{\{#else\}\}(.*?)\{\{\/if\}\}/gs;

  return template.replace(
    ifElseRegex,
    (match, condition, ifContent, elseContent) => {
      const result = evaluateCondition(condition.trim(), data);
      return result ? ifContent : elseContent;
    }
  );
}

// Process loops {{#each items}} ... {{/each}}
export function processLoops(template: string, data: any): string {
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
            const { evaluateExpression } = require("./json-template.utils");
            const expression = `this${filterPart}`;
            const result = evaluateExpression(expression, { this: item });
            return typeof result === "string" ? result : JSON.stringify(result);
          }
        );

        // Replace {{@index}} with current index
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));

        // Replace {{@first}} and {{@last}}
        itemContent = itemContent.replace(
          /\{\{@first\}\}/g,
          String(index === 0)
        );
        itemContent = itemContent.replace(
          /\{\{@last\}\}/g,
          String(index === array.length - 1)
        );

        // Handle {{#unless @last}} within loops
        const isLast = index === array.length - 1;
        itemContent = itemContent.replace(
          /\{\{#unless @last\}\}(.*?)\{\{\/unless\}\}/g,
          (match: string, content: string) => (!isLast ? content : "")
        );

        // Process conditionals within this loop iteration using the item context
        itemContent = processIfElse(itemContent, item);
        itemContent = processConditionals(itemContent, item);
        itemContent = processUnless(itemContent, item);

        // Replace item properties {{propertyName}} and {{propertyName | filters}}
        if (item && typeof item === "object") {
          const { evaluateExpression } = require("./json-template.utils");

          // Find all {{...}} expressions that aren't special (@index, @first, @last, this)
          // and aren't control structures (#if, #else, #unless, #each, etc.)
          itemContent = itemContent.replace(
            /\{\{(?!@|this\b|#|\/)([\w\s|().'",-]+)\}\}/g,
            (match: string, expression: string) => {
              const result = evaluateExpression(expression.trim(), item);
              return typeof result === "string"
                ? result
                : JSON.stringify(result);
            }
          );
        }

        return itemContent;
      })
      .join("");
  });
}

// Variables support {{#set varName = value}} ... {{varName}}
export function processVariables(template: string, data: any): string {
  // Import the filter-aware evaluateExpression from json-template.utils
  const {
    evaluateExpression: evaluateExpressionWithFilters,
  } = require("./json-template.utils");

  // Ensure filters are initialized before using evaluateExpression
  const { initializeFilters } = require("./json-template.utils");
  initializeFilters();

  const variables: Record<string, any> = {};

  // Extract variable definitions
  const setRegex = /\{\{#set\s+(\w+)\s*=\s*([^}]+)\}\}/g;
  const templateWithoutSets = template.replace(
    setRegex,
    (match, varName, expression) => {
      const result = evaluateExpressionWithFilters(expression.trim(), {
        ...data,
        ...variables,
      });
      variables[varName] = result;
      return "";
    }
  );

  // Replace variable references
  let result = templateWithoutSets;
  Object.keys(variables).forEach((varName) => {
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, "g");
    const value = variables[varName];
    result = result.replace(
      regex,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  });

  return result;
}

// Comments support {{!-- comment --}}
export function processComments(template: string): string {
  const commentRegex = /\{\{!--.*?--\}\}/gs;
  return template.replace(commentRegex, "");
}

function evaluateCondition(condition: string, data: any): boolean {
  // Handle simple comparisons
  const comparisonRegex = /^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/;
  const match = condition.match(comparisonRegex);

  if (match) {
    const [, left, operator, right] = match;
    const leftValue = evaluateExpression(left.trim(), data);
    const rightValue = evaluateExpression(right.trim(), data);

    switch (operator) {
      case "===":
        return leftValue === rightValue;
      case "!==":
        return leftValue !== rightValue;
      case "==":
        return leftValue == rightValue;
      case "!=":
        return leftValue != rightValue;
      case ">=":
        return Number(leftValue) >= Number(rightValue);
      case "<=":
        return Number(leftValue) <= Number(rightValue);
      case ">":
        return Number(leftValue) > Number(rightValue);
      case "<":
        return Number(leftValue) < Number(rightValue);
      default:
        return false;
    }
  }

  // Handle simple boolean expressions
  const value = evaluateExpression(condition, data);
  return Boolean(value);
}

function evaluateExpression(expression: string, data: any): any {
  // Handle filters
  if (expression.includes("|")) {
    const parts = expression.split("|").map((p) => p.trim());
    const [rawPath, ...filterParts] = parts;
    let value = getObjectPath(rawPath, data);

    for (const part of filterParts) {
      const match = part.match(/^(\w+)(?:\((.*?)\))?$/);
      if (!match) continue;

      const [, name, argsString] = match;
      const fn = getFilter(name);
      if (!fn) continue;

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

  // Handle literals
  if (expression.startsWith('"') && expression.endsWith('"')) {
    return expression.slice(1, -1);
  }

  if (expression.startsWith("'") && expression.endsWith("'")) {
    return expression.slice(1, -1);
  }

  if (!isNaN(Number(expression))) {
    return Number(expression);
  }

  if (expression === "true") return true;
  if (expression === "false") return false;
  if (expression === "null") return null;

  // Handle object path
  return getObjectPath(expression, data);
}

function getObjectPath(path: string, data: any): any {
  const parts = path.split(".");
  let current = data;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return null;
    current = current[part];
  }
  return current;
}

// Extract variables from {{#set}} declarations
function extractVariables(template: string, data: any): Record<string, any> {
  const {
    evaluateExpression: evaluateExpressionWithFilters,
  } = require("./json-template.utils");

  const { initializeFilters } = require("./json-template.utils");
  initializeFilters();

  const variables: Record<string, any> = {};

  const setRegex = /\{\{#set\s+(\w+)\s*=\s*([^}]+)\}\}/g;
  let match;
  while ((match = setRegex.exec(template)) !== null) {
    const [, varName, expression] = match;
    const result = evaluateExpressionWithFilters(expression.trim(), {
      ...data,
      ...variables,
    });
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
    const regex = new RegExp(`\\{\\{${varName}\\}\\}`, "g");
    const value = variables[varName];
    result = result.replace(
      regex,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  });

  return result;
}

// Process unless blocks {{#unless condition}} ... {{/unless}}
export function processUnless(template: string, data: any): string {
  const unlessRegex = /\{\{#unless\s+([^}]+)\}\}(.*?)\{\{\/unless\}\}/gs;

  return template.replace(unlessRegex, (match, condition, content) => {
    const result = evaluateCondition(condition.trim(), data);
    return !result ? content : "";
  });
}

export function compileAdvancedTemplate(template: string, data: any): string {
  // Import the basic template compiler
  const { compileJSONTemplate } = require("./json-template.utils");

  let result = template;

  // Process in order
  result = processComments(result);

  // Extract variables first and merge them with data
  const variables = extractVariables(result, data);
  const enrichedData = { ...data, ...variables };
  result = replaceVariables(result, variables);

  // Process loops first (which will handle conditionals within loops)
  result = processLoops(result, enrichedData);

  // Then process any remaining conditionals at the global level
  result = processIfElse(result, enrichedData);
  result = processConditionals(result, enrichedData);
  result = processUnless(result, enrichedData);

  // Apply basic template compilation for filters
  result = compileJSONTemplate(result, enrichedData);

  return result;
}
