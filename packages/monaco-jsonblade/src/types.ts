export interface FunctionDefinition {
  signature: string;
  description: string;
}

export interface JSONBladeOptions {
  functions?: { [key: string]: FunctionDefinition };
}

export interface DataStructure {
  type: string;
  items?: DataStructure;
  value?: any;
  [key: string]: any;
}

export interface FunctionCompletion {
  name: string;
  signature: string;
  description: string;
  insertText: string;
}

export interface JSONBladeContext {
  currentData: any;
  currentDataSchema: DataStructure;
  currentFunctions: { [key: string]: FunctionDefinition };
  currentFunctionImplementations: { [key: string]: Function };
}

export type Monaco = typeof import("monaco-editor");
export type ITextModel = import("monaco-editor").editor.ITextModel;
export type Position = import("monaco-editor").Position;
export type CompletionItem = import("monaco-editor").languages.CompletionItem;
export type Range = import("monaco-editor").IRange;
