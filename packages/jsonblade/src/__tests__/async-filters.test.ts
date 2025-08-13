import { registerAsyncFilter, getAsyncFilter } from "../async-filter-registry";

describe("Async Filters", () => {
  beforeEach(() => {
    // Clear any previously registered filters
    if ((globalThis as any).__asyncFilters) {
      (globalThis as any).__asyncFilters.clear();
    }
  });

  describe("Custom Async Filters", () => {
    test("should register and use custom async filter", async () => {
      // Register custom async filter
      registerAsyncFilter("delay", async (value: any, ms: string = "100") => {
        await new Promise((resolve) => setTimeout(resolve, Number(ms)));
        return value;
      });

      const filter = getAsyncFilter("delay");
      expect(filter).toBeDefined();

      const start = Date.now();
      const result = await filter!("test", "100");
      const duration = Date.now() - start;

      expect(result).toBe("test");
      expect(duration).toBeGreaterThanOrEqual(90); // Allow some timing variance
    });

    test("should register custom getSecret filter", async () => {
      // Mock environment for test
      const originalEnv = process.env.TEST_SECRET;
      process.env.TEST_SECRET = "secret_value";

      registerAsyncFilter("getSecret", async (value: any, key?: string) => {
        const secretName = key || String(value);
        return process.env[secretName] || null;
      });

      const filter = getAsyncFilter("getSecret");
      const result = await filter!("", "TEST_SECRET");

      expect(result).toBe("secret_value");

      // Restore original
      if (originalEnv !== undefined) {
        process.env.TEST_SECRET = originalEnv;
      } else {
        delete process.env.TEST_SECRET;
      }
    });

    test("should register custom JSON parser filter", async () => {
      registerAsyncFilter("jsonParse", async (value: any) => {
        try {
          return JSON.parse(String(value));
        } catch (error) {
          return `Error: Invalid JSON - ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      });

      const filter = getAsyncFilter("jsonParse");

      // Valid JSON
      const validResult = await filter!('{"name":"Alice","age":30}');
      expect(validResult).toEqual({ name: "Alice", age: 30 });

      // Invalid JSON
      const invalidResult = await filter!('{"name":Alice}');
      expect(invalidResult).toContain("Error: Invalid JSON");
    });

    test("should handle filter errors gracefully", async () => {
      registerAsyncFilter("errorFilter", async () => {
        throw new Error("Test error");
      });

      const filter = getAsyncFilter("errorFilter");

      try {
        await filter!("test");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Test error");
      }
    });

    test("should return undefined for non-existent filter", () => {
      const filter = getAsyncFilter("nonExistentFilter");
      expect(filter).toBeUndefined();
    });
  });

  describe("Filter Registration", () => {
    test("should override existing filter when re-registered", async () => {
      registerAsyncFilter("testFilter", async () => "first");
      registerAsyncFilter("testFilter", async () => "second");

      const filter = getAsyncFilter("testFilter");
      const result = await filter!("");

      expect(result).toBe("second");
    });

    test("should handle multiple custom filters", async () => {
      registerAsyncFilter("uppercase", async (value: any) =>
        String(value).toUpperCase()
      );
      registerAsyncFilter("reverse", async (value: any) =>
        String(value).split("").reverse().join("")
      );

      const upperFilter = getAsyncFilter("uppercase");
      const reverseFilter = getAsyncFilter("reverse");

      const upperResult = await upperFilter!("hello");
      const reverseResult = await reverseFilter!("world");

      expect(upperResult).toBe("HELLO");
      expect(reverseResult).toBe("dlrow");
    });
  });
});
