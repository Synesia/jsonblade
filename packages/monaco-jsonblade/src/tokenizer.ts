import { Monaco } from "./types";
import { LANGUAGE_ID } from "./constants";

export function registerTokensProvider(monaco: Monaco): void {
  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
    tokenizer: {
      root: [
        [/"/, { token: "string", next: "@string" }],
        [/'/, { token: "string", next: "@stringSingle" }],
        [/\{\{/, { token: "delimiter.jsonblade", next: "@jsonblade" }],
        [/\d+(\.\d+)?/, "number"],
        [/true|false/, "keyword"],
        [/null/, "keyword"],
        [/[{}[\],:]/, "delimiter"],
        [/\s+/, "white"],
      ],

      string: [
        [/\{\{/, { token: "delimiter.jsonblade", next: "@jsonbladeInString" }],
        [/\\./, "string.escape"],
        [/[^\\"{]/, "string"],
        [/"/, { token: "string", next: "@pop" }],
      ],

      stringSingle: [
        [/\{\{/, { token: "delimiter.jsonblade", next: "@jsonbladeInString" }],
        [/\\./, "string.escape"],
        [/[^\\'{]/, "string"],
        [/'/, { token: "string", next: "@pop" }],
      ],

      jsonblade: [
        [/\}\}/, { token: "delimiter.jsonblade", next: "@pop" }],
        [/!--[\s\S]*?--(?=\}\})/, "comment"],
        [/#(if|unless|each|set|else)\b/, "keyword.directive"],
        [/\/(if|unless|each)\b/, "keyword.directive"],
        [/@(index|first|last)\b/, "variable.predefined"],
        [/\bthis\b/, "variable.predefined"],
        [/\|/, "operator"],
        [/=/, "operator"],
        [/,/, "delimiter"],
        [/[()]/, "delimiter.parenthesis"],
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/\d+(\.\d+)?/, "number"],
        [/true|false/, "keyword"],
        [/null/, "keyword"],
        [
          /[a-zA-Z_][a-zA-Z0-9_]*/,
          { token: "identifier", next: "@checkIdentifier" },
        ],
        [/\./, "operator"],
        [/\s+/, "white"],
      ],

      jsonbladeInString: [
        [/\}\}/, { token: "delimiter.jsonblade", next: "@pop" }],
        [/!--[\s\S]*?--(?=\}\})/, "comment"],
        [/#(if|unless|each|set|else)\b/, "keyword.directive"],
        [/\/(if|unless|each)\b/, "keyword.directive"],
        [/@(index|first|last)\b/, "variable.predefined"],
        [/\bthis\b/, "variable.predefined"],
        [/\|/, "operator"],
        [/=/, "operator"],
        [/,/, "delimiter"],
        [/[()]/, "delimiter.parenthesis"],
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/\d+(\.\d+)?/, "number"],
        [/true|false/, "keyword"],
        [/null/, "keyword"],
        [
          /[a-zA-Z_][a-zA-Z0-9_]*/,
          { token: "identifier", next: "@checkIdentifier" },
        ],
        [/\./, "operator"],
        [/\s+/, "white"],
      ],

      checkIdentifier: [
        [/\./, "operator", "@pop"],
        [/[^a-zA-Z0-9_.]/, { token: "@rematch", next: "@pop" }],
        [/$/, { token: "@rematch", next: "@pop" }],
      ],
    },
  });
}
