import { compileJSONTemplate } from "../json-template.utils";

describe("New filters", () => {
  describe("String filters", () => {
    test("should apply trim filter", () => {
      const template = `{"value": "{{text | trim}}"}`;
      const data = { text: "  hello world  " };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "hello world"}`);
    });
  });

  describe("Array filters", () => {
    test("should apply join filter with default separator", () => {
      const template = `{"value": "{{items | join}}"}`;
      const data = { items: ["a", "b", "c"] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "a,b,c"}`);
    });

    test("should apply join filter with custom separator", () => {
      const template = `{"value": "{{items | join(' - ')}}"}`;
      const data = { items: ["apple", "banana", "cherry"] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"value": "apple - banana - cherry"}`);
    });

    test("should apply length filter on array", () => {
      const template = `{"count": {{items | length}}}`;
      const data = { items: [1, 2, 3, 4] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"count": 4}`);
    });

    test("should apply length filter on string", () => {
      const template = `{"count": {{text | length}}}`;
      const data = { text: "hello" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"count": 5}`);
    });

    test("should apply length filter on object", () => {
      const template = `{"count": {{obj | length}}}`;
      const data = { obj: { a: 1, b: 2, c: 3 } };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"count": 3}`);
    });

    test("should apply first filter on array", () => {
      const template = `{"first": "{{items | first}}"}`;
      const data = { items: ["apple", "banana", "cherry"] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"first": "apple"}`);
    });

    test("should apply first filter on string", () => {
      const template = `{"first": "{{text | first}}"}`;
      const data = { text: "hello" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"first": "h"}`);
    });

    test("should apply last filter on array", () => {
      const template = `{"last": "{{items | last}}"}`;
      const data = { items: ["apple", "banana", "cherry"] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"last": "cherry"}`);
    });

    test("should apply last filter on string", () => {
      const template = `{"last": "{{text | last}}"}`;
      const data = { text: "hello" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"last": "o"}`);
    });

    test("should apply map filter", () => {
      const template = `{"names": {{users | map(name)}}}`;
      const data = {
        users: [
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 },
        ],
      };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"names": ["Alice","Bob"]}`);
    });

    test("should apply filter function", () => {
      const template = `{"adults": {{users | filter(age, 25)}}}`;
      const data = {
        users: [
          { name: "Alice", age: 25 },
          { name: "Bob", age: 30 },
          { name: "Charlie", age: 20 },
        ],
      };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"adults": [{"name":"Alice","age":25}]}`);
    });
  });

  describe("Object filters", () => {
    describe("json filter", () => {
      test("should serialize object to JSON", () => {
        const template = `{"serialized": "{{obj | json}}"}`;
        const data = { obj: { name: "Alice", age: 25 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"serialized": "{"name":"Alice","age":25}"}`);
      });

      test("should serialize array to JSON", () => {
        const template = `{"serialized": "{{arr | json}}"}`;
        const data = { arr: [1, 2, 3] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"serialized": "[1,2,3]"}`);
      });

      test("should serialize null to JSON", () => {
        const template = `{"serialized": "{{value | json}}"}`;
        const data = { value: null };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"serialized": "null"}`);
      });

      test("should serialize undefined to JSON", () => {
        const template = `{"serialized": "{{value | json}}"}`;
        const data = {};
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"serialized": ""}`);
      });
    });

    describe("keys filter", () => {
      test("should return object keys", () => {
        const template = `{"keys": {{obj | keys}}}`;
        const data = { obj: { name: "Alice", age: 25, city: "Paris" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keys": ["name","age","city"]}`);
      });

      test("should return empty array for empty object", () => {
        const template = `{"keys": {{obj | keys}}}`;
        const data = { obj: {} };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keys": []}`);
      });

      test("should return empty array for null", () => {
        const template = `{"keys": {{obj | keys}}}`;
        const data = { obj: null };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keys": []}`);
      });

      test("should return empty array for undefined", () => {
        const template = `{"keys": {{obj | keys}}}`;
        const data = {};
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keys": []}`);
      });

      test("should return empty array for arrays", () => {
        const template = `{"keys": {{arr | keys}}}`;
        const data = { arr: [1, 2, 3] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keys": []}`);
      });

      test("should return empty array for non-objects", () => {
        const template = `{"keys": {{value | keys}}}`;
        const data = { value: "string" };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keys": []}`);
      });
    });

    describe("values filter", () => {
      test("should return object values", () => {
        const template = `{"values": {{obj | values}}}`;
        const data = { obj: { name: "Alice", age: 25 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"values": ["Alice",25]}`);
      });

      test("should return empty array for empty object", () => {
        const template = `{"values": {{obj | values}}}`;
        const data = { obj: {} };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"values": []}`);
      });

      test("should return empty array for null", () => {
        const template = `{"values": {{obj | values}}}`;
        const data = { obj: null };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"values": []}`);
      });

      test("should return empty array for undefined", () => {
        const template = `{"values": {{obj | values}}}`;
        const data = {};
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"values": []}`);
      });

      test("should return empty array for arrays", () => {
        const template = `{"values": {{arr | values}}}`;
        const data = { arr: [1, 2, 3] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"values": []}`);
      });

      test("should handle object with mixed value types", () => {
        const template = `{"values": {{obj | values}}}`;
        const data = { obj: { str: "hello", num: 42, bool: true, nil: null } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"values": ["hello",42,true,null]}`);
      });
    });

    describe("get filter", () => {
      test("should get property value", () => {
        const template = `{"name": "{{obj | get(name)}}"}`;
        const data = { obj: { name: "Alice", age: 25 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"name": "Alice"}`);
      });

      test("should get nested property", () => {
        const template = `{"street": "{{user | get(address.street)}}"}`;
        const data = { user: { "address.street": "Main St" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"street": "Main St"}`);
      });

      test("should return null for non-existent property", () => {
        const template = `{"value": {{obj | get(nonexistent)}}}`;
        const data = { obj: { name: "Alice" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": null}`);
      });

      test("should return null for null object", () => {
        const template = `{"value": {{obj | get(name)}}}`;
        const data = { obj: null };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": null}`);
      });

      test("should return null for undefined object", () => {
        const template = `{"value": {{obj | get(name)}}}`;
        const data = {};
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": null}`);
      });

      test("should work with arrays using numeric indices", () => {
        const template = `{"value": "{{arr | get(0)}}"}`;
        const data = { arr: ["first", "second"] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": "first"}`);
      });

      test("should return null for non-existent array index", () => {
        const template = `{"value": {{arr | get(5)}}}`;
        const data = { arr: ["first", "second"] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": null}`);
      });

      test("should return null when no key provided", () => {
        const template = `{"value": {{obj | get()}}}`;
        const data = { obj: { name: "Alice" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": null}`);
      });

      test("should handle numeric property names", () => {
        const template = `{"value": "{{obj | get(123)}}"}`;
        const data = { obj: { "123": "numeric key" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"value": "numeric key"}`);
      });
    });

    describe("has filter", () => {
      test("should return true for existing property", () => {
        const template = `{"hasName": {{obj | has(name)}}}`;
        const data = { obj: { name: "Alice", age: 25 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasName": true}`);
      });

      test("should return false for non-existent property", () => {
        const template = `{"hasCity": {{obj | has(city)}}}`;
        const data = { obj: { name: "Alice", age: 25 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasCity": false}`);
      });

      test("should return true for property with null value", () => {
        const template = `{"hasCity": {{obj | has(city)}}}`;
        const data = { obj: { name: "Alice", city: null } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasCity": true}`);
      });

      test("should return true for property with undefined value", () => {
        const template = `{"hasCity": {{obj | has(city)}}}`;
        const data = { obj: { name: "Alice", city: undefined } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasCity": true}`);
      });

      test("should return false for null object", () => {
        const template = `{"hasName": {{obj | has(name)}}}`;
        const data = { obj: null };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasName": false}`);
      });

      test("should return false for undefined object", () => {
        const template = `{"hasName": {{obj | has(name)}}}`;
        const data = {};
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasName": false}`);
      });

      test("should work with arrays using numeric indices", () => {
        const template = `{"hasIndex": {{arr | has(0)}}}`;
        const data = { arr: ["first", "second"] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasIndex": true}`);
      });

      test("should return false for non-existent array index", () => {
        const template = `{"hasIndex": {{arr | has(5)}}}`;
        const data = { arr: ["first", "second"] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasIndex": false}`);
      });

      test("should return false when no key provided", () => {
        const template = `{"hasKey": {{obj | has()}}}`;
        const data = { obj: { name: "Alice" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasKey": false}`);
      });

      test("should handle numeric property names", () => {
        const template = `{"hasNumeric": {{obj | has(123)}}}`;
        const data = { obj: { "123": "value" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasNumeric": true}`);
      });
    });

    describe("entries filter", () => {
      test("should return object entries as key-value pairs", () => {
        const template = `{"entries": {{obj | entries}}}`;
        const data = { obj: { name: "Alice", age: 25 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"entries": [["name","Alice"],["age",25]]}`);
      });

      test("should return empty array for empty object", () => {
        const template = `{"entries": {{obj | entries}}}`;
        const data = { obj: {} };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"entries": []}`);
      });

      test("should return empty array for null", () => {
        const template = `{"entries": {{obj | entries}}}`;
        const data = { obj: null };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"entries": []}`);
      });

      test("should return empty array for undefined", () => {
        const template = `{"entries": {{obj | entries}}}`;
        const data = {};
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"entries": []}`);
      });

      test("should return empty array for arrays", () => {
        const template = `{"entries": {{arr | entries}}}`;
        const data = { arr: [1, 2, 3] };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"entries": []}`);
      });

      test("should handle object with mixed value types", () => {
        const template = `{"entries": {{obj | entries}}}`;
        const data = { obj: { str: "hello", num: 42, bool: true, nil: null } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(
          `{"entries": [["str","hello"],["num",42],["bool",true],["nil",null]]}`
        );
      });

      test("should handle numeric and special keys", () => {
        const template = `{"entries": {{obj | entries}}}`;
        const data = {
          obj: { "123": "numeric", "special-key": "value", $symbol: "dollar" },
        };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(
          `{"entries": [["123","numeric"],["special-key","value"],["$symbol","dollar"]]}`
        );
      });
    });

    describe("chained object filters", () => {
      test("should chain keys and length filters", () => {
        const template = `{"keyCount": {{obj | keys | length}}}`;
        const data = { obj: { a: 1, b: 2, c: 3 } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"keyCount": 3}`);
      });

      test("should chain get and json filters", () => {
        const template = `{"userJson": "{{data | get(user) | json}}"}`;
        const data = { data: { user: { name: "Alice", age: 25 } } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"userJson": "{"name":"Alice","age":25}"}`);
      });

      test("should chain has and bool filters", () => {
        const template = `{"hasNameBool": {{obj | has(name) | bool}}}`;
        const data = { obj: { name: "Alice" } };
        const result = compileJSONTemplate(template, data);
        expect(result).toBe(`{"hasNameBool": true}`);
      });
    });
  });

  describe("Logic filters", () => {
    test("should apply equals filter with true result", () => {
      const template = `{"isAlice": {{name | equals(Alice)}}}`;
      const data = { name: "Alice" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"isAlice": true}`);
    });

    test("should apply equals filter with false result", () => {
      const template = `{"isAlice": {{name | equals(Alice)}}}`;
      const data = { name: "Bob" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"isAlice": false}`);
    });

    test("should apply not filter", () => {
      const template = `{"notActive": {{active | not}}}`;
      const data = { active: true };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"notActive": false}`);
    });

    test("should apply bool filter on truthy value", () => {
      const template = `{"hasValue": {{text | bool}}}`;
      const data = { text: "hello" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"hasValue": true}`);
    });

    test("should apply bool filter on falsy value", () => {
      const template = `{"hasValue": {{text | bool}}}`;
      const data = { text: "" };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"hasValue": false}`);
    });
  });

  describe("Complex filter combinations", () => {
    test("should chain multiple new filters", () => {
      const template = `{"result": "{{users | map(name) | join(' and ') | upper}}"}`;
      const data = {
        users: [{ name: "alice" }, { name: "bob" }],
      };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"result": "ALICE AND BOB"}`);
    });

    test("should combine array and logic filters", () => {
      const template = `{"isEmpty": {{items | length | equals(0)}}}`;
      const data = { items: [] };
      const result = compileJSONTemplate(template, data);
      expect(result).toBe(`{"isEmpty": true}`);
    });
  });
});
