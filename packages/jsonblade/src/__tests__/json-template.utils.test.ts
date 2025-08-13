import { JSONBlade } from "../jsonblade";

describe("JSONBlade.compile", () => {
  describe("Basic string interpolation", () => {
    test("should interpolate simple values in strings", () => {
      const template = `{"name": "Hello {{name}}!"}`;
      const data = { name: "World" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ name: "Hello World!" });
    });

    test("should interpolate multiple values in same string", () => {
      const template = `{"message": "{{greeting}} {{name}}, welcome!"}`;
      const data = { greeting: "Hello", name: "John" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ message: "Hello John, welcome!" });
    });

    test("should handle empty string interpolation", () => {
      const template = `{"value": "prefix-{{missing}}-suffix"}`;
      const data = {};
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "prefix--suffix" });
    });
  });

  describe("Full value interpolation", () => {
    test("should interpolate complete JSON values", () => {
      const template = `{"count": {{count}}, "active": {{active}}}`;
      const data = { count: 42, active: true };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ count: 42, active: true });
    });

    test("should interpolate null values", () => {
      const template = `{"value": {{missing}}}`;
      const data = {};
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: null });
    });

    test("should interpolate array values", () => {
      const template = `{"items": {{items}}}`;
      const data = { items: [1, 2, 3] };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    test("should interpolate object values", () => {
      const template = `{"user": {{user}}}`;
      const data = { user: { name: "John", age: 30 } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ user: { name: "John", age: 30 } });
    });
  });

  describe("Object path access", () => {
    test("should access nested object properties", () => {
      const template = `{"userName": "{{user.name}}"}`;
      const data = { user: { name: "Alice", age: 25 } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ userName: "Alice" });
    });

    test("should access deeply nested properties", () => {
      const template = `{"city": "{{user.address.city}}"}`;
      const data = {
        user: {
          address: {
            city: "Paris",
            country: "France",
          },
        },
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ city: "Paris" });
    });

    test("should return null for non-existent nested properties", () => {
      const template = `{"value": {{user.missing.property}}}`;
      const data = { user: { name: "John" } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: null });
    });

    test("should handle null intermediate objects", () => {
      const template = `{"value": "{{user.profile.name}}"}`;
      const data = { user: null };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "" });
    });
  });

  describe("Filters", () => {
    test("should apply upper filter", () => {
      const template = `{"name": "{{name | upper}}"}`;
      const data = { name: "john doe" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ name: "JOHN DOE" });
    });

    test("should apply lower filter", () => {
      const template = `{"name": "{{name | lower}}"}`;
      const data = { name: "JOHN DOE" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ name: "john doe" });
    });

    test("should apply capitalize filter", () => {
      const template = `{"name": "{{name | capitalize}}"}`;
      const data = { name: "john doe" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ name: "John doe" });
    });

    test("should apply default filter with argument", () => {
      const template = `{"value": "{{missing | default('fallback')}}"}`;
      const data = {};
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "fallback" });
    });

    test("should apply default filter without quotes", () => {
      const template = `{"value": "{{missing | default(fallback)}}"}`;
      const data = {};
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "fallback" });
    });

    test("should not apply default filter when value exists", () => {
      const template = `{"value": "{{name | default('fallback')}}"}`;
      const data = { name: "John" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "John" });
    });

    test("should apply default filter for empty string", () => {
      const template = `{"value": "{{name | default('fallback')}}"}`;
      const data = { name: "" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "fallback" });
    });

    test("should chain multiple filters", () => {
      const template = `{"value": "{{name | lower | capitalize}}"}`;
      const data = { name: "JOHN DOE" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "John doe" });
    });

    test("should handle unknown filters gracefully", () => {
      const template = `{"value": "{{name | unknown | upper}}"}`;
      const data = { name: "john" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "JOHN" });
    });
  });

  describe("Edge cases", () => {
    test("should handle template without interpolation", () => {
      const template = `{"static": "value", "number": 42}`;
      const data = { unused: "data" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ static: "value", number: 42 });
    });

    test("should handle empty template", () => {
      const template = "";
      const data = { name: "test" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toBe("");
    });

    test("should handle empty data object", () => {
      const template = `{"value": "{{missing}}"}`;
      const data = {};
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "" });
    });

    test("should handle null data", () => {
      const template = `{"value": "{{anything}}"}`;
      const data = null;
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "" });
    });

    test("should handle number values in filters", () => {
      const template = `{"value": "{{count | upper}}"}`;
      const data = { count: 123 };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "123" });
    });

    test("should handle boolean values in filters", () => {
      const template = `{"value": "{{active | upper}}"}`;
      const data = { active: true };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "TRUE" });
    });
  });

  describe("Complex scenarios", () => {
    test("should handle mixed interpolation types", () => {
      const template = `{
        "greeting": "Hello {{user.name | capitalize}}!",
        "userData": {{user}},
        "isActive": {{user.active}},
        "count": {{items.length}}
      }`;
      const data = {
        user: { name: "alice", active: true },
        items: [1, 2, 3],
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({
        greeting: "Hello Alice!",
        userData: { name: "alice", active: true },
        isActive: true,
        count: 3,
      });
    });

    test("should handle arrays with object access", () => {
      const template = `{"first": "{{users.0.name}}", "count": {{users.length}}}`;
      const data = {
        users: [{ name: "Alice" }, { name: "Bob" }],
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ first: "Alice", count: 2 });
    });
  });

  describe("Custom Functions", () => {
    test("should use custom function", () => {
      const template = `{"result": "{{getSecret('API_KEY')}}"}`;
      const data = {};
      const functions = [
        {
          name: "getSecret",
          func: (key: string) => `secret_${key}`,
        },
      ];

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data, functions);
      expect(result).toEqual({ result: "secret_API_KEY" });
    });

    test("should use multiple custom functions", () => {
      const template = `{
        "secret": "{{getSecret('DB_PASSWORD')}}",
        "sum": {{add(5, 3)}}
      }`;
      const data = {};
      const functions = [
        {
          name: "getSecret",
          func: (key: string) => `env_${key}`,
        },
        {
          name: "add",
          func: (a: number, b: number) => a + b,
        },
      ];

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data, functions);
      expect(result).toEqual({
        secret: "env_DB_PASSWORD",
        sum: 8,
      });
    });

    test("should work without functions parameter", () => {
      const template = `{"value": "{{name}}"}`;
      const data = { name: "test" };

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);
      expect(result).toEqual({ value: "test" });
    });

    test("should fallback to data path when function not found", () => {
      const template = `{"value": "{{unknownFunction()}}"}`;
      const data = { unknownFunction: "fallback" };
      const functions = [
        {
          name: "getSecret",
          func: (key: string) => `secret_${key}`,
        },
      ];

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data, functions);
      expect(result).toEqual({ value: "" });
    });
  });

  describe("Async Custom Functions", () => {
    test("should use async custom function", async () => {
      const template = `{"result": "{{getSecret('API_KEY')}}"}`;
      const data = {};
      const functions = [
        {
          name: "getSecret",
          func: async (key: string) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return `async_secret_${key}`;
          },
        },
      ];

      const jb = new JSONBlade({ useBuiltins: true });
      const result = await jb.compileAsync(template, data, functions);
      expect(result).toEqual({ result: "async_secret_API_KEY" });
    });

    test("should handle async functions with multiple arguments", async () => {
      const template = `{"result": {{calculate(10, 5, 'multiply')}}}`;
      const data = {};
      const functions = [
        {
          name: "calculate",
          func: async (a: number, b: number, operation: string) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            if (operation === "multiply") return a * b;
            if (operation === "add") return a + b;
            return 0;
          },
        },
      ];

      const jb = new JSONBlade({ useBuiltins: true });
      const result = await jb.compileAsync(template, data, functions);
      expect(result).toEqual({ result: 50 });
    });
  });
});
