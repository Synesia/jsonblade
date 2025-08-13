import {
  Monaco,
  ITextModel,
  Position,
  CompletionItem,
  JSONBladeContext,
  FunctionCompletion,
} from "./types";
import { getPropertiesForPath } from "./data-analyzer";
import { FILTERS, DIRECTIVES, LOOP_KEYWORDS, LANGUAGE_ID } from "./constants";

function getFunctionCompletions(
  context: JSONBladeContext
): FunctionCompletion[] {
  return Object.entries(context.currentFunctions).map(([name, func]) => ({
    name,
    signature: func.signature,
    description: func.description,
    insertText: func.signature.includes("${")
      ? func.signature
      : `${name}(\${1})`,
  }));
}

function createMainCompletionProvider(
  monaco: Monaco,
  context: JSONBladeContext
) {
  return {
    provideCompletionItems: (model: ITextModel, position: Position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: CompletionItem[] = [];

      const lastOpenBrace = textUntilPosition.lastIndexOf("{{");
      const lastCloseBrace = textUntilPosition.lastIndexOf("}}");

      const isInJSONBladeExpression =
        lastOpenBrace > lastCloseBrace && lastOpenBrace !== -1;

      if (isInJSONBladeExpression) {
        const inExpression = textUntilPosition.substring(lastOpenBrace + 2);

        if (inExpression.includes("|")) {
          const lastPipe = inExpression.lastIndexOf("|");
          const afterPipe = inExpression.substring(lastPipe + 1).trim();

          FILTERS.forEach((filter) => {
            if (!afterPipe || filter.startsWith(afterPipe)) {
              suggestions.push({
                label: filter,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: filter,
                documentation: `Filter: ${filter}`,
                range: range,
              });
            }
          });
        } else if (inExpression.includes(".")) {
          const lastDot = inExpression.lastIndexOf(".");
          const beforeDot = inExpression.substring(0, lastDot);
          const afterDot = inExpression.substring(lastDot + 1);

          const cleanPath = beforeDot.trim().replace(/^\s*/, "");
          console.log(
            "Looking for properties after dot. cleanPath:",
            cleanPath
          );
          const properties = getPropertiesForPath(
            cleanPath,
            context.currentDataSchema
          );

          properties.forEach((prop) => {
            if (!afterDot || prop.startsWith(afterDot)) {
              suggestions.push({
                label: prop,
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: prop,
                documentation: `Property: ${cleanPath}.${prop}`,
                range: range,
              });
            }
          });
        } else if (inExpression.trim().startsWith("#")) {
          DIRECTIVES.forEach((directive) => {
            const label = `#${directive}`;
            if (label.startsWith(inExpression.trim())) {
              suggestions.push({
                label: label,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: `#${directive} `,
                documentation: `Directive: ${directive}`,
                range: range,
              });
            }
          });
        } else if (inExpression.trim().startsWith("@")) {
          LOOP_KEYWORDS.forEach((keyword) => {
            if (keyword.startsWith(inExpression.trim())) {
              suggestions.push({
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: keyword,
                documentation: `Loop keyword: ${keyword}`,
                range: range,
              });
            }
          });
        } else if (
          inExpression.trim().startsWith("t") ||
          inExpression.trim() === ""
        ) {
          if ("this".startsWith(inExpression.trim())) {
            suggestions.push({
              label: "this",
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: "this",
              documentation: "Current item in loop",
              range: range,
            });
          }
        } else {
          const currentInput = inExpression.trim();

          getFunctionCompletions(context).forEach((func) => {
            if (!currentInput || func.name.startsWith(currentInput)) {
              suggestions.push({
                label: func.name,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: func.insertText,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: func.description,
                detail: func.signature,
                range: range,
              });
            }
          });

          if (
            context.currentDataSchema &&
            typeof context.currentDataSchema === "object"
          ) {
            Object.keys(context.currentDataSchema).forEach((variable) => {
              if (
                variable !== "type" &&
                (!currentInput || variable.startsWith(currentInput))
              ) {
                suggestions.push({
                  label: variable,
                  kind: monaco.languages.CompletionItemKind.Variable,
                  insertText: variable,
                  documentation: `Variable: ${variable}`,
                  range: range,
                });
              }
            });
          }
        }
      }

      return { suggestions };
    },
    triggerCharacters: [".", "|", "#", "@"],
  };
}

function createSnippetProvider(monaco: Monaco) {
  return {
    provideCompletionItems: (model: ITextModel, position: Position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const snippets: CompletionItem[] = [
        {
          label: "if",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ["{{#if ${1:condition}}}", "\t$0", "{{/if}}"].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If condition block",
          range: range,
        },
        {
          label: "each",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: ["{{#each ${1:array}}}", "\t$0", "{{/each}}"].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Each loop block",
          range: range,
        },
      ];

      return { suggestions: snippets };
    },
    triggerCharacters: ["{"],
  };
}

export function registerCompletionProviders(
  monaco: Monaco,
  context: JSONBladeContext
): void {
  monaco.languages.registerCompletionItemProvider(
    LANGUAGE_ID,
    createMainCompletionProvider(monaco, context)
  );

  monaco.languages.registerCompletionItemProvider(
    LANGUAGE_ID,
    createSnippetProvider(monaco)
  );
}

export function setupCodeActions(monaco: Monaco): void {
  monaco.languages.registerCodeActionProvider(LANGUAGE_ID, {
    provideCodeActions: () => {
      return {
        actions: [],
        dispose: () => {},
      };
    },
  });
}
