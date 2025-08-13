export function registerJSONBladeLanguage(
  monaco: typeof import("monaco-editor"),
  data?: any,
  options?: {
    functions?: { [key: string]: { signature: string; description: string } };
  }
) {
  monaco.languages.register({ id: "jsonblade" });

  // Stocker séparément les données et les fonctions
  let currentData = data;
  let currentDataSchema = data ? analyzeDataStructure(data) : {};
  let currentFunctions = options?.functions || {};
  let currentFunctionImplementations: { [key: string]: Function } = {};

  // Fonction pour mettre à jour les données (sans toucher aux fonctions)
  function updateData(newData: any) {
    currentData = newData;
    currentDataSchema = newData ? analyzeDataStructure(newData) : {};
    console.log("Updated data schema:", currentDataSchema);
  }

  // Fonction pour enregistrer une fonction
  function registerFunction(
    name: string,
    impl: Function,
    signature?: string,
    description?: string
  ) {
    currentFunctionImplementations[name] = impl;

    // Auto-détecter la signature si pas fournie
    if (!signature) {
      const funcString = impl.toString();
      const paramMatch = funcString.match(/\(([^)]*)\)/);
      const params =
        paramMatch && paramMatch[1]
          ? paramMatch[1]
              .split(",")
              .map((p) => p.trim())
              .filter((p) => p)
          : [];
      signature =
        params.length > 0
          ? params
              .map((_, index) => `'\${${index + 1}:param${index + 1}}'`)
              .join(", ")
          : "";
    }

    currentFunctions[name] = {
      signature: signature,
      description: description || `Function: ${name}`,
    };

    console.log(
      `Registered function: ${name}(${signature}) - ${description || `Function: ${name}`}`
    );
  }

  // Fonction pour supprimer une fonction
  function unregisterFunction(name: string) {
    delete currentFunctions[name];
    delete currentFunctionImplementations[name];
    console.log(`Unregistered function: ${name}`);
  }

  // Fonction pour obtenir les données enrichies avec les fonctions pour l'exécution
  function getDataWithFunctions() {
    return {
      ...currentData,
      ...currentFunctionImplementations,
    };
  }

  monaco.languages.setMonarchTokensProvider("jsonblade", {
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
        [/!.*(?=\}\})/, "comment"],
        [/#(if|unless|each|set|else)\b/, "keyword.directive"],
        [/\/(if|unless|each)\b/, "keyword.directive"],
        [/@(index|first|last)\b/, "variable.predefined"],
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
        [/!.*(?=\}\})/, "comment"],
        [/#(if|unless|each|set|else)\b/, "keyword.directive"],
        [/\/(if|unless|each)\b/, "keyword.directive"],
        [/@(index|first|last)\b/, "variable.predefined"],
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

  monaco.editor.defineTheme("jsonblade-theme", {
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

  // Fonction améliorée pour analyser la structure des données
  function analyzeDataStructure(obj: any, maxDepth = 4, currentDepth = 0): any {
    if (!obj || currentDepth > maxDepth) {
      return { type: typeof obj };
    }

    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return { type: "array", items: { type: "unknown" } };
      }

      // Analyser le premier élément pour obtenir la structure
      const firstItem = analyzeDataStructure(
        obj[0],
        maxDepth,
        currentDepth + 1
      );

      // Si c'est un tableau d'objets, on merge les propriétés de tous les éléments
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
      const structure: any = { type: "object" };
      for (const [key, value] of Object.entries(obj)) {
        structure[key] = analyzeDataStructure(
          value,
          maxDepth,
          currentDepth + 1
        );
      }
      return structure;
    }

    return { type: typeof obj, value: obj };
  }

  // Génération du schéma à partir des données injectées
  console.log("Analysed data schema:", currentDataSchema);

  // Génération de la liste des fonctions à partir des fonctions injectées
  function getFunctionCompletions() {
    return Object.entries(currentFunctions).map(([name, func]) => ({
      name,
      signature: func.signature,
      description: func.description,
      insertText: func.signature.includes("${")
        ? func.signature
        : `${name}(\${1})`,
    }));
  }

  const filters = [
    "upper",
    "lower",
    "capitalize",
    "trim",
    "default",
    "slug",
    "join",
    "length",
    "first",
    "last",
    "map",
    "filter",
    "reverse",
    "sort",
    "unique",
    "equals",
    "not",
    "bool",
    "gt",
    "gte",
    "lt",
    "lte",
    "contains",
    "startsWith",
    "endsWith",
    "isEmpty",
    "round",
    "ceil",
    "floor",
    "abs",
    "currency",
    "percentage",
    "multiply",
    "divide",
    "add",
    "subtract",
    "formatDate",
    "fromNow",
    "dayOfWeek",
    "timestamp",
    "isEmail",
    "isURL",
    "isUUID",
    "isNumber",
    "isInteger",
    "json",
    "keys",
    "values",
  ];

  // Fonction améliorée pour obtenir les propriétés d'un path dans les données
  function getPropertiesForPath(path: string): string[] {
    console.log("Getting properties for path:", path);
    const parts = path.split(".");
    let current: any = currentDataSchema;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
        console.log(`After part '${part}':`, current);

        // Si c'est un array, on prend les propriétés de ses items
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

  // Fonction pour valider si un path existe dans les données
  function validatePath(path: string): boolean {
    const parts = path.split(".");
    let current: any = currentDataSchema;

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

  // Types simplifiés pour éviter les complications TypeScript
  type CompletionItem = any;
  type ITextModel = any;
  type Position = any;

  monaco.languages.registerCompletionItemProvider("jsonblade", {
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

      // Améliorer la détection : vérifier si on est dans une expression JSONBlade ouverte
      const lastOpenBrace = textUntilPosition.lastIndexOf("{{");
      const lastCloseBrace = textUntilPosition.lastIndexOf("}}");

      // On est dans une expression si la dernière ouverture est après la dernière fermeture
      const isInJSONBladeExpression =
        lastOpenBrace > lastCloseBrace && lastOpenBrace !== -1;

      if (isInJSONBladeExpression) {
        const inExpression = textUntilPosition.substring(lastOpenBrace + 2);

        // Completion après un pipe (filtres)
        if (inExpression.includes("|")) {
          const lastPipe = inExpression.lastIndexOf("|");
          const afterPipe = inExpression.substring(lastPipe + 1).trim();

          filters.forEach((filter) => {
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
        }
        // Completion après un point (propriétés d'objet)
        else if (inExpression.includes(".")) {
          const lastDot = inExpression.lastIndexOf(".");
          const beforeDot = inExpression.substring(0, lastDot);
          const afterDot = inExpression.substring(lastDot + 1);

          // Nettoyage du path (suppression des espaces et caractères indésirables)
          const cleanPath = beforeDot.trim().replace(/^\s*/, "");
          console.log(
            "Looking for properties after dot. cleanPath:",
            cleanPath
          );
          const properties = getPropertiesForPath(cleanPath);

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
        }
        // Completion des directives
        else if (inExpression.trim().startsWith("#")) {
          ["if", "unless", "each", "set"].forEach((directive) => {
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
        }
        // Completion des variables de boucle
        else if (inExpression.trim().startsWith("@")) {
          ["@index", "@first", "@last"].forEach((keyword) => {
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
        }
        // Completion des variables principales et fonctions
        else {
          const currentInput = inExpression.trim();

          // Fonctions
          getFunctionCompletions().forEach((func) => {
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

          // Variables principales (depuis les données injectées)
          if (currentDataSchema && typeof currentDataSchema === "object") {
            Object.keys(currentDataSchema).forEach((variable) => {
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
  });

  monaco.languages.registerCompletionItemProvider("jsonblade", {
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
  });

  // Diagnostic provider pour la validation des champs
  monaco.languages.registerCodeActionProvider("jsonblade", {
    provideCodeActions: () => {
      return {
        actions: [],
        dispose: () => {},
      };
    },
  });

  // Fonction de validation pour signaler les erreurs
  function validateModel(model: ITextModel) {
    const value = model.getValue();
    const markers: any[] = [];

    // Regex pour trouver toutes les expressions JSONBlade
    const expressionRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = expressionRegex.exec(value)) !== null) {
      const expression = match[1]!.trim();
      const startPos = model.getPositionAt(match.index + 2); // +2 pour ignorer {{
      const endPos = model.getPositionAt(match.index + match[0].length - 2); // -2 pour ignorer }}

      if (!startPos || !endPos) {
        continue;
      }

      // Ignorer les commentaires, directives et variables de boucle
      if (
        expression.startsWith("!") ||
        expression.startsWith("#") ||
        expression.startsWith("/") ||
        expression.startsWith("@")
      ) {
        continue;
      }

      // Extraire la variable principale (avant le premier pipe ou espace)
      const variablePart = expression.split("|")[0]!.split(" ")[0]!.trim();

      // Ignorer les fonctions (contiennent des parenthèses ou sont dans la liste des fonctions injectées)
      if (
        variablePart.includes("(") ||
        Object.keys(currentFunctions).some((fn) => variablePart.startsWith(fn))
      ) {
        continue;
      }

      // Valider que le path existe dans les données
      if (variablePart && !validatePath(variablePart)) {
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

    monaco.editor.setModelMarkers(model, "jsonblade", markers);
  }

  // Enregistrer la validation sur les changements de modèle
  monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === "jsonblade") {
      validateModel(model);
      model.onDidChangeContent(() => {
        validateModel(model);
      });
    }
  });

  // Exposer la fonction de validation pour l'utiliser après le changement de langage
  (monaco as any).jsonblade = {
    validateModel: validateModel,
    updateData: updateData,
    registerFunction: registerFunction,
    unregisterFunction: unregisterFunction,
    getDataWithFunctions: getDataWithFunctions,
  };
}

export function createJSONBladeModel(
  value: string = "",
  uri?: ReturnType<typeof import("monaco-editor").Uri.parse>
) {
  // Cette fonction ne peut pas être utilisée sans l'instance Monaco fournie par beforeMount
  throw new Error(
    "Use monaco.editor.createModel directly with the monaco instance from beforeMount"
  );
}
