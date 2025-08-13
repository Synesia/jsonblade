import { setupValidation } from "../validation";
import { LANGUAGE_ID } from "../constants";

function createMockMonaco() {
  const markers: any[] = [];
  const monaco: any = {
    MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
    languages: {
      register: jest.fn(),
    },
    editor: {
      setModelMarkers: (_model: any, _owner: string, m: any[]) => {
        markers.splice(0, markers.length, ...m);
      },
      onDidCreateModel: (cb: any) => {
        (monaco as any).__createModel = cb;
      },
    },
  };
  return { monaco, markers } as const;
}

function makeModel(value: string) {
  const text = value;
  return {
    getValue: () => text,
    getLanguageId: () => LANGUAGE_ID,
    onDidChangeContent: (cb: any) => {
      cb();
    },
    getWordUntilPosition: jest.fn(),
    getValueInRange: jest.fn(),
    getPositionAt: (offset: number) => {
      return { lineNumber: 1, column: offset + 1 };
    },
  } as any;
}

describe("validation structural blocks", () => {
  test("unclosed if block", () => {
    const { monaco, markers } = createMockMonaco();
    setupValidation(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} },
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );

    const model = makeModel('{\n  "v": "{{#if user.active}}text"\n}');
    (monaco as any).__createModel(model);
    expect(markers.some((m) => m.code === "jsonblade-unclosed-block")).toBe(
      true
    );
  });

  test("misplaced else", () => {
    const { monaco, markers } = createMockMonaco();
    setupValidation(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} },
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );
    const model = makeModel("{{#else}} text");
    (monaco as any).__createModel(model);
    expect(markers.some((m) => m.code === "jsonblade-misplaced-else")).toBe(
      true
    );
  });

  test("duplicate else", () => {
    const { monaco, markers } = createMockMonaco();
    setupValidation(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} },
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );
    const model = makeModel("{{#if cond}}A{{#else}}B{{#else}}C{{/if}}");
    (monaco as any).__createModel(model);
    expect(markers.some((m) => m.code === "jsonblade-duplicate-else")).toBe(
      true
    );
  });

  test("unmatched /each", () => {
    const { monaco, markers } = createMockMonaco();
    setupValidation(
      monaco as any,
      {
        currentData: {},
        currentDataSchema: { type: "object", properties: {} },
        currentFunctions: {},
        currentFunctionImplementations: {},
      } as any
    );
    const model = makeModel("{{/each}}");
    (monaco as any).__createModel(model);
    expect(markers.some((m) => m.code === "jsonblade-unmatched-each")).toBe(
      true
    );
  });
});
