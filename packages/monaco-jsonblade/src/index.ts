import {
  Monaco,
  JSONBladeOptions,
  JSONBladeContext,
  FunctionDefinition,
} from "./types";
import { LANGUAGE_ID } from "./constants";
import { analyzeDataStructure } from "./data-analyzer";
import { registerTokensProvider } from "./tokenizer";
import { defineTheme } from "./theme";
import {
  registerCompletionProviders,
  setupCodeActions,
} from "./completion-provider";
import { setupValidation, createValidator } from "./validation";

export function registerJSONBladeLanguage(
  monaco: Monaco,
  data?: any,
  options?: JSONBladeOptions
) {
  monaco.languages.register({ id: LANGUAGE_ID });

  const context: JSONBladeContext = {
    currentData: data,
    currentDataSchema: data ? analyzeDataStructure(data) : { type: "unknown" },
    currentFunctions: options?.functions || {},
    currentFunctionImplementations: {},
  };

  console.log("Analysed data schema:", context.currentDataSchema);

  function updateData(newData: any) {
    context.currentData = newData;
    context.currentDataSchema = newData
      ? analyzeDataStructure(newData)
      : { type: "unknown" };
    console.log("Updated data schema:", context.currentDataSchema);
  }

  function registerFunction(
    name: string,
    impl: Function,
    signature?: string,
    description?: string
  ) {
    context.currentFunctionImplementations[name] = impl;

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

    context.currentFunctions[name] = {
      signature: signature,
      description: description || `Function: ${name}`,
    };

    console.log(
      `Registered function: ${name}(${signature}) - ${description || `Function: ${name}`}`
    );
  }

  function unregisterFunction(name: string) {
    delete context.currentFunctions[name];
    delete context.currentFunctionImplementations[name];
    console.log(`Unregistered function: ${name}`);
  }

  function getDataWithFunctions() {
    return {
      ...context.currentData,
      ...context.currentFunctionImplementations,
    };
  }

  registerTokensProvider(monaco);
  defineTheme(monaco);
  registerCompletionProviders(monaco, context);
  setupCodeActions(monaco);
  setupValidation(monaco, context);

  (monaco as any).jsonblade = {
    validateModel: createValidator(monaco, context),
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
  throw new Error(
    "Use monaco.editor.createModel directly with the monaco instance from beforeMount"
  );
}
