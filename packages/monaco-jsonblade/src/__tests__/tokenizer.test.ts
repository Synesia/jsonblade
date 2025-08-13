import { registerTokensProvider } from "../tokenizer";
import { LANGUAGE_ID } from "../constants";

describe("tokenizer basic", () => {
  test("registers monarch provider without error", () => {
    const monaco: any = {
      languages: {
        setMonarchTokensProvider: jest.fn(),
      },
    };
    registerTokensProvider(monaco);
    expect(monaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(
      LANGUAGE_ID,
      expect.any(Object)
    );
  });
});
