import { Monaco } from "./types";
import { THEME_NAME } from "./constants";

export function defineTheme(monaco: Monaco): void {
  monaco.editor.defineTheme(THEME_NAME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "delimiter.jsonblade", foreground: "569cd6", fontStyle: "bold" },
      { token: "keyword.directive", foreground: "c586c0", fontStyle: "bold" },
      { token: "variable.predefined", foreground: "4fc1ff", fontStyle: "bold" },
      { token: "operator", foreground: "d4d4d4" },
      { token: "comment", foreground: "6a9955", fontStyle: "italic" },
      { token: "string", foreground: "ce9178" },
      { token: "string.escape", foreground: "d7ba7d" },
      { token: "number", foreground: "b5cea8" },
      { token: "keyword", foreground: "569cd6" },
      { token: "identifier", foreground: "9cdcfe" },
      {
        token: "identifier.invalid",
        foreground: "f44747",
        fontStyle: "underline",
      },
      { token: "delimiter.parenthesis", foreground: "ffd700" },
    ],
    colors: {},
  });
}
