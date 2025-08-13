import { registerCompletionProviders } from "../completion-provider";
import { LANGUAGE_ID, FILTERS, DIRECTIVES, LOOP_KEYWORDS } from "../constants";

function createMockMonaco() {
  const providers: any[] = [];
  const monaco: any = {
    languages: {
      CompletionItemKind: {
        Function: 1,
        Property: 2,
        Keyword: 3,
        Variable: 4,
        Snippet: 27,
      },
      CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
      registerCompletionItemProvider: (_id: string, provider: any) => {
        providers.push(provider);
      },
    },
  };
  return { monaco, providers } as const;
}

function makeModel(value: string) {
  const text = value;
  return {
    getValueInRange: ({
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
    }: any) => {
      const lines = text.split("\n");
      const upTo = lines
        .slice(0, endLineNumber)
        .map((l, i) =>
          i === endLineNumber - 1 ? l.slice(0, endColumn - 1) : l
        )
        .join("\n");
      return upTo;
    },
    getWordUntilPosition: ({ lineNumber, column }: any) => ({
      startColumn: column,
      endColumn: column,
    }),
  } as any;
}

describe("completion provider", () => {
  test("suggest filters after pipe", async () => {
    const { monaco, providers } = createMockMonaco();
    registerCompletionProviders(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} } as any,
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );

    const provider = providers[0];
    const model = makeModel('{\n "v": "{{user.name | "\n}');
    const result = await provider.provideCompletionItems(model, {
      lineNumber: 2,
      column: 21,
    });
    const labels = result.suggestions.map((s: any) => s.label);
    expect(labels).toEqual(expect.arrayContaining(FILTERS));
  });

  test("suggest properties after dot", async () => {
    const { monaco, providers } = createMockMonaco();
    registerCompletionProviders(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: {
          type: "object",
          user: { type: "object", name: { type: "string" } },
        } as any,
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );
    const provider = providers[0];
    const model = makeModel("{{user.}}");
    const result = await provider.provideCompletionItems(model, {
      lineNumber: 1,
      column: 8,
    });
    const labels = result.suggestions.map((s: any) => s.label);
    expect(labels).toContain("name");
  });

  test("suggest directives after #", async () => {
    const { monaco, providers } = createMockMonaco();
    registerCompletionProviders(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} } as any,
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );
    const provider = providers[0];
    const model = makeModel("{{#}}");
    const result = await provider.provideCompletionItems(model, {
      lineNumber: 1,
      column: 4,
    });
    const labels = result.suggestions.map((s: any) => s.label);
    expect(labels).toEqual(
      expect.arrayContaining(DIRECTIVES.map((d) => `#${d}`))
    );
  });

  test("suggest loop keywords and this", async () => {
    const { monaco, providers } = createMockMonaco();
    registerCompletionProviders(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} } as any,
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );
    const provider = providers[0];
    const model = makeModel("{{@}}");
    const result = await provider.provideCompletionItems(model, {
      lineNumber: 1,
      column: 4,
    });
    const labels = result.suggestions.map((s: any) => s.label);
    expect(labels).toEqual(expect.arrayContaining(LOOP_KEYWORDS));

    const model2 = makeModel("{{t}}");
    const result2 = await provider.provideCompletionItems(model2, {
      lineNumber: 1,
      column: 4,
    });
    const labels2 = result2.suggestions.map((s: any) => s.label);
    expect(labels2).toContain("this");
  });
});
