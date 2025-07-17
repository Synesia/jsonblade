import { compileJSONTemplate } from "../json-template.utils";

describe("compileJSONTemplate", () => {
  describe("Basic string interpolation", () => {
    test("should interpolate simple values in strings", () => {
      const template = `{"name": "Hello {{name}}!"}`;
      const data = { name: "World" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"name": "Hello World!"}`);
    });

    test("should interpolate multiple values in same string", () => {
      const template = `{"message": "{{greeting}} {{name}}, welcome!"}`;
      const data = { greeting: "Hello", name: "John" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"message": "Hello John, welcome!"}`);
    });

    test("should handle empty string interpolation", () => {
      const template = `{"value": "prefix-{{missing}}-suffix"}`;
      const data = {};
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "prefix--suffix"}`);
    });
  });

  describe("Full value interpolation", () => {
    test("should interpolate complete JSON values", () => {
      const template = `{"count": {{count}}, "active": {{active}}}`;
      const data = { count: 42, active: true };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"count": 42, "active": true}`);
    });

    test("should interpolate null values", () => {
      const template = `{"value": {{missing}}}`;
      const data = {};
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": null}`);
    });

    test("should interpolate array values", () => {
      const template = `{"items": {{items}}}`;
      const data = { items: [1, 2, 3] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"items": [1,2,3]}`);
    });

    test("should interpolate object values", () => {
      const template = `{"user": {{user}}}`;
      const data = { user: { name: "John", age: 30 } };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"user": {"name":"John","age":30}}`);
    });
  });

  describe("Object path access", () => {
    test("should access nested object properties", () => {
      const template = `{"userName": "{{user.name}}"}`;
      const data = { user: { name: "Alice", age: 25 } };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"userName": "Alice"}`);
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
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"city": "Paris"}`);
    });

    test("should return null for non-existent nested properties", () => {
      const template = `{"value": {{user.missing.property}}}`;
      const data = { user: { name: "John" } };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": null}`);
    });

    test("should handle null intermediate objects", () => {
      const template = `{"value": "{{user.profile.name}}"}`;
      const data = { user: null };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": ""}`);
    });
  });

  describe("Filters", () => {
    test("should apply upper filter", () => {
      const template = `{"name": "{{name | upper}}"}`;
      const data = { name: "john doe" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"name": "JOHN DOE"}`);
    });

    test("should apply lower filter", () => {
      const template = `{"name": "{{name | lower}}"}`;
      const data = { name: "JOHN DOE" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"name": "john doe"}`);
    });

    test("should apply capitalize filter", () => {
      const template = `{"name": "{{name | capitalize}}"}`;
      const data = { name: "john doe" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"name": "John doe"}`);
    });

    test("should apply default filter with argument", () => {
      const template = `{"value": "{{missing | default('fallback')}}"}`;
      const data = {};
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "fallback"}`);
    });

    test("should apply default filter without quotes", () => {
      const template = `{"value": "{{missing | default(fallback)}}"}`;
      const data = {};
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "fallback"}`);
    });

    test("should not apply default filter when value exists", () => {
      const template = `{"value": "{{name | default('fallback')}}"}`;
      const data = { name: "John" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "John"}`);
    });

    test("should apply default filter for empty string", () => {
      const template = `{"value": "{{name | default('fallback')}}"}`;
      const data = { name: "" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "fallback"}`);
    });

    test("should chain multiple filters", () => {
      const template = `{"value": "{{name | lower | capitalize}}"}`;
      const data = { name: "JOHN DOE" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "John doe"}`);
    });

    test("should handle unknown filters gracefully", () => {
      const template = `{"value": "{{name | unknown | upper}}"}`;
      const data = { name: "john" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "JOHN"}`);
    });
  });

  describe("Edge cases", () => {
    test("should handle template without interpolation", () => {
      const template = `{"static": "value", "number": 42}`;
      const data = { unused: "data" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"static": "value", "number": 42}`);
    });

    test("should handle empty template", () => {
      const template = "";
      const data = { name: "test" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe("");
    });

    test("should handle empty data object", () => {
      const template = `{"value": "{{missing}}"}`;
      const data = {};
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": ""}`);
    });

    test("should handle null data", () => {
      const template = `{"value": "{{anything}}"}`;
      const data = null;
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": ""}`);
    });

    test("should handle number values in filters", () => {
      const template = `{"value": "{{count | upper}}"}`;
      const data = { count: 123 };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "123"}`);
    });

    test("should handle boolean values in filters", () => {
      const template = `{"value": "{{active | upper}}"}`;
      const data = { active: true };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "TRUE"}`);
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
      const result = compileJSONTemplate(template, data);
      const expected = `{
        "greeting": "Hello Alice!",
        "userData": {"name":"alice","active":true},
        "isActive": true,
        "count": 3
      }`;
      expect(result).toBe(expected);
    });

    test("should handle arrays with object access", () => {
      const template = `{"first": "{{users.0.name}}", "count": {{users.length}}}`;
      const data = {
        users: [{ name: "Alice" }, { name: "Bob" }],
      };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"first": "Alice", "count": 2}`);
    });
  });
});
