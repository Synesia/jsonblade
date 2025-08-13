import { Monaco, ITextModel, JSONBladeContext } from "./types";
import { validatePath } from "./data-analyzer";
import { LANGUAGE_ID } from "./constants";

export function createValidator(
  monaco: Monaco,
  context: JSONBladeContext
): (model: ITextModel) => void {
  return function validateModel(model: ITextModel): void {
    const value = model.getValue();
    const markers: any[] = [];

    const expressionRegex = /\{\{([\s\S]*?)\}\}/g;
    let match;

    type BlockType = "if" | "each" | "unless";
    type OpenBlock = {
      type: BlockType;
      startOffset: number;
      startLineNumber: number;
      startColumn: number;
      hasElse?: boolean;
    };
    const blockStack: OpenBlock[] = [];

    while ((match = expressionRegex.exec(value)) !== null) {
      const expression = match[1]!.trim();
      const startPos = model.getPositionAt(match.index + 2);
      const endPos = model.getPositionAt(match.index + match[0].length - 2);

      if (!startPos || !endPos) {
        continue;
      }

      if (expression.startsWith("!--")) {
        // comment, ignore
        continue;
      }

      // Structural directive validation
      if (expression.startsWith("#") || expression.startsWith("/")) {
        const expr = expression;
        const startLineNumber = startPos!.lineNumber;
        const startColumn = startPos!.column;

        // Opening blocks
        if (/^#if\b/.test(expr)) {
          blockStack.push({
            type: "if",
            startOffset: match.index,
            startLineNumber,
            startColumn,
            hasElse: false,
          });
          continue;
        }
        if (/^#each\b/.test(expr)) {
          blockStack.push({
            type: "each",
            startOffset: match.index,
            startLineNumber,
            startColumn,
          });
          continue;
        }
        if (/^#unless\b/.test(expr)) {
          blockStack.push({
            type: "unless",
            startOffset: match.index,
            startLineNumber,
            startColumn,
          });
          continue;
        }
        if (/^#set\b/.test(expr)) {
          // not a block, ignore
          continue;
        }
        if (/^#else\b/.test(expr)) {
          const top = blockStack[blockStack.length - 1];
          if (!top || top.type !== "if") {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber,
              startColumn,
              endLineNumber: endPos!.lineNumber,
              endColumn: endPos!.column,
              message: "`{{#else}}` must be inside an open `{{#if}}` block",
              code: "jsonblade-misplaced-else",
            });
          } else if (top.hasElse) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber,
              startColumn,
              endLineNumber: endPos!.lineNumber,
              endColumn: endPos!.column,
              message: "Duplicate `{{#else}}` in the same `{{#if}}` block",
              code: "jsonblade-duplicate-else",
            });
          } else {
            top.hasElse = true;
          }
          continue;
        }

        // Closing blocks
        if (/^\/if\b/.test(expr)) {
          const top = blockStack.pop();
          if (!top || top.type !== "if") {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber,
              startColumn,
              endLineNumber: endPos!.lineNumber,
              endColumn: endPos!.column,
              message: "Unexpected `{{/if}}` without matching `{{#if}}`",
              code: "jsonblade-unmatched-if",
            });
          }
          continue;
        }
        if (/^\/each\b/.test(expr)) {
          const top = blockStack.pop();
          if (!top || top.type !== "each") {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber,
              startColumn,
              endLineNumber: endPos!.lineNumber,
              endColumn: endPos!.column,
              message: "Unexpected `{{/each}}` without matching `{{#each}}`",
              code: "jsonblade-unmatched-each",
            });
          }
          continue;
        }
        if (/^\/unless\b/.test(expr)) {
          const top = blockStack.pop();
          if (!top || top.type !== "unless") {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber,
              startColumn,
              endLineNumber: endPos!.lineNumber,
              endColumn: endPos!.column,
              message:
                "Unexpected `{{/unless}}` without matching `{{#unless}}`",
              code: "jsonblade-unmatched-unless",
            });
          }
          continue;
        }
      }

      const variablePart = expression.split("|")[0]!.split(" ")[0]!.trim();

      if (
        variablePart.includes("(") ||
        Object.keys(context.currentFunctions).some((fn) =>
          variablePart.startsWith(fn)
        )
      ) {
        continue;
      }

      if (
        variablePart &&
        !validatePath(variablePart, context.currentDataSchema)
      ) {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          startLineNumber: startPos!.lineNumber,
          startColumn: startPos!.column,
          endLineNumber: endPos!.lineNumber,
          endColumn: endPos!.column,
          message: `Property '${variablePart}' does not exist in data structure`,
          code: "jsonblade-unknown-property",
        });
      }
    }

    // Unclosed blocks at EOF
    for (const open of blockStack) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: open.startLineNumber,
        startColumn: open.startColumn,
        endLineNumber: open.startLineNumber,
        endColumn: open.startColumn + 2,
        message: `Unclosed '{{#${open.type}}}' block`,
        code: "jsonblade-unclosed-block",
      });
    }

    monaco.editor.setModelMarkers(model, LANGUAGE_ID, markers);
  };
}

export function setupValidation(
  monaco: Monaco,
  context: JSONBladeContext
): void {
  const validator = createValidator(monaco, context);

  monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === LANGUAGE_ID) {
      validator(model);
      model.onDidChangeContent(() => {
        validator(model);
      });
    }
  });
}
