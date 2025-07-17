import { compileJSONTemplate, registerFilter } from "../index";

describe("Complete Filter Test Suite", () => {
  // Reset filters before each test
  beforeEach(() => {
    // Clear any custom filters
    Object.keys(require("../filter-registry").filterRegistry.filters).forEach(
      (key) => {
        if (
          ![
            "upper",
            "lower",
            "capitalize",
            "default",
            "trim",
            "join",
            "length",
            "first",
            "last",
            "map",
            "filter",
            "json",
            "keys",
            "values",
            "get",
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
          ].includes(key)
        ) {
          require("../filter-registry").filterRegistry.unregisterFilter(key);
        }
      }
    );
  });

  describe("String Filters", () => {
    test("upper - should convert to uppercase", () => {
      const result = compileJSONTemplate('{"text": "{{value | upper}}"}', {
        value: "hello world",
      });
      expect(result).toBe('{"text": "HELLO WORLD"}');
    });

    test("lower - should convert to lowercase", () => {
      const result = compileJSONTemplate('{"text": "{{value | lower}}"}', {
        value: "HELLO WORLD",
      });
      expect(result).toBe('{"text": "hello world"}');
    });

    test("capitalize - should capitalize first letter", () => {
      const result = compileJSONTemplate('{"text": "{{value | capitalize}}"}', {
        value: "hello world",
      });
      expect(result).toBe('{"text": "Hello world"}');
    });

    test("default - should use default value when empty", () => {
      const result = compileJSONTemplate(
        '{"text": "{{missing | default(\'fallback\')}}"}',
        {}
      );
      expect(result).toBe('{"text": "fallback"}');
    });

    test("default - should use original value when present", () => {
      const result = compileJSONTemplate(
        '{"text": "{{value | default(\'fallback\')}}"}',
        { value: "original" }
      );
      expect(result).toBe('{"text": "original"}');
    });

    test("trim - should remove leading and trailing whitespace", () => {
      const result = compileJSONTemplate('{"text": "{{value | trim}}"}', {
        value: "  hello  ",
      });
      expect(result).toBe('{"text": "hello"}');
    });
  });

  describe("Array Filters", () => {
    test("join - should join array with default separator", () => {
      const result = compileJSONTemplate('{"text": "{{items | join}}"}', {
        items: ["a", "b", "c"],
      });
      expect(result).toBe('{"text": "a,b,c"}');
    });

    test("join - should join array with custom separator", () => {
      const result = compileJSONTemplate(
        '{"text": "{{items | join(\'-\')}}"}',
        { items: ["a", "b", "c"] }
      );
      expect(result).toBe('{"text": "a-b-c"}');
    });

    test("length - should return array length", () => {
      const result = compileJSONTemplate('{"count": {{items | length}}}', {
        items: [1, 2, 3, 4],
      });
      expect(result).toBe('{"count": 4}');
    });

    test("length - should return string length", () => {
      const result = compileJSONTemplate('{"count": {{text | length}}}', {
        text: "hello",
      });
      expect(result).toBe('{"count": 5}');
    });

    test("length - should return object length", () => {
      const result = compileJSONTemplate('{"count": {{obj | length}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toBe('{"count": 2}');
    });

    test("first - should return first element", () => {
      const result = compileJSONTemplate('{"first": "{{items | first}}"}', {
        items: ["apple", "banana"],
      });
      expect(result).toBe('{"first": "apple"}');
    });

    test("last - should return last element", () => {
      const result = compileJSONTemplate('{"last": "{{items | last}}"}', {
        items: ["apple", "banana"],
      });
      expect(result).toBe('{"last": "banana"}');
    });

    test("map - should map object property", () => {
      const result = compileJSONTemplate(
        "{\"names\": {{users | map('name') | json}}}",
        {
          users: [{ name: "Alice" }, { name: "Bob" }],
        }
      );
      expect(result).toBe('{"names": "[\\"Alice\\",\\"Bob\\"]"}');
    });

    test("filter - should filter by property value", () => {
      const result = compileJSONTemplate(
        "{\"active\": {{users | filter('active', true) | length}}}",
        {
          users: [{ active: true }, { active: false }, { active: true }],
        }
      );
      expect(result).toBe('{"active": 2}');
    });
  });

  describe("Object Filters", () => {
    test("json - should serialize to JSON", () => {
      const result = compileJSONTemplate('{"data": {{obj | json}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toBe('{"data": "{\\"a\\":1,\\"b\\":2}"}');
    });

    test("keys - should return object keys", () => {
      const result = compileJSONTemplate('{"keys": {{obj | keys}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toBe('{"keys": ["a","b"]}');
    });

    test("values - should return object values", () => {
      const result = compileJSONTemplate('{"values": {{obj | values}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toBe('{"values": [1,2]}');
    });

    test("get - should get object property", () => {
      const result = compileJSONTemplate("{\"value\": {{obj | get('a')}}}", {
        obj: { a: 42, b: 2 },
      });
      expect(result).toBe('{"value": 42}');
    });
  });

  describe("Logic Filters", () => {
    test("equals - should compare values", () => {
      const result = compileJSONTemplate('{"same": {{value | equals(42)}}}', {
        value: 42,
      });
      expect(result).toBe('{"same": true}');
    });

    test("not - should negate boolean", () => {
      const result = compileJSONTemplate('{"opposite": {{value | not}}}', {
        value: true,
      });
      expect(result).toBe('{"opposite": false}');
    });

    test("bool - should convert to boolean", () => {
      const result = compileJSONTemplate('{"bool": {{value | bool}}}', {
        value: "hello",
      });
      expect(result).toBe('{"bool": true}');
    });

    test("gt - should check greater than", () => {
      const result = compileJSONTemplate('{"greater": {{value | gt(10)}}}', {
        value: 15,
      });
      expect(result).toBe('{"greater": true}');
    });

    test("gte - should check greater than or equal", () => {
      const result = compileJSONTemplate('{"gte": {{value | gte(10)}}}', {
        value: 10,
      });
      expect(result).toBe('{"gte": true}');
    });

    test("lt - should check less than", () => {
      const result = compileJSONTemplate('{"less": {{value | lt(10)}}}', {
        value: 5,
      });
      expect(result).toBe('{"less": true}');
    });

    test("lte - should check less than or equal", () => {
      const result = compileJSONTemplate('{"lte": {{value | lte(10)}}}', {
        value: 10,
      });
      expect(result).toBe('{"lte": true}');
    });
  });

  describe("Date Filters", () => {
    beforeEach(() => {
      require("../filters/date-filters").registerDateFilters();
    });

    test("formatDate - should format date with pattern", () => {
      const result = compileJSONTemplate(
        '{"date": "{{date | formatDate(\'DD/MM/YYYY\')}}"}',
        {
          date: "2023-01-15T10:00:00Z",
        }
      );
      expect(result).toBe('{"date": "15/01/2023"}');
    });

    test("fromNow - should calculate relative time", () => {
      const now = new Date().toISOString();
      const result = compileJSONTemplate('{"relative": "{{date | fromNow}}"}', {
        date: now,
      });
      expect(result).toContain("just now");
    });

    test("addDays - should add days to date", () => {
      const result = compileJSONTemplate(
        '{"future": "{{date | addDays(7) | formatDate(\'DD/MM/YYYY\')}}"}',
        {
          date: "2023-01-15T10:00:00Z",
        }
      );
      expect(result).toBe('{"future": "22/01/2023"}');
    });

    test("isoDate - should convert to ISO format", () => {
      const result = compileJSONTemplate('{"iso": "{{date | isoDate}}"}', {
        date: "15/01/2023",
      });
      expect(result).toBe('{"iso": "2023-01-15T00:00:00.000Z"}');
    });

    test("timestamp - should convert to timestamp", () => {
      const result = compileJSONTemplate('{"ts": {{date | timestamp}}}', {
        date: "2023-01-01T00:00:00Z",
      });
      expect(result).toBe('{"ts": 1672531200000}');
    });
  });

  describe("Number Filters", () => {
    beforeEach(() => {
      require("../filters/number-filters").registerNumberFilters();
    });

    test("round - should round to specified decimals", () => {
      const result = compileJSONTemplate('{"rounded": {{value | round(2)}}}', {
        value: 3.14159,
      });
      expect(result).toBe('{"rounded": 3.14}');
    });

    test("ceil - should round up", () => {
      const result = compileJSONTemplate('{"ceil": {{value | ceil}}}', {
        value: 3.14,
      });
      expect(result).toBe('{"ceil": 4}');
    });

    test("floor - should round down", () => {
      const result = compileJSONTemplate('{"floor": {{value | floor}}}', {
        value: 3.14,
      });
      expect(result).toBe('{"floor": 3}');
    });

    test("abs - should return absolute value", () => {
      const result = compileJSONTemplate('{"abs": {{value | abs}}}', {
        value: -42,
      });
      expect(result).toBe('{"abs": 42}');
    });

    test("currency - should format as currency", () => {
      const result = compileJSONTemplate(
        '{"price": "{{amount | currency(\'EUR\')}}"}',
        { amount: 1234.56 }
      );
      expect(result).toBe('{"price": "1 234,56 €"}');
    });

    test("percentage - should format as percentage", () => {
      const result = compileJSONTemplate(
        '{"percent": "{{ratio | percentage(1)}}"}',
        { ratio: 0.756 }
      );
      expect(result).toBe('{"percent": "75.6%"}');
    });

    test("add - should add number", () => {
      const result = compileJSONTemplate('{"sum": {{value | add(10)}}}', {
        value: 5,
      });
      expect(result).toBe('{"sum": 15}');
    });

    test("subtract - should subtract number", () => {
      const result = compileJSONTemplate('{"diff": {{value | subtract(3)}}}', {
        value: 10,
      });
      expect(result).toBe('{"diff": 7}');
    });

    test("multiply - should multiply number", () => {
      const result = compileJSONTemplate(
        '{"product": {{value | multiply(3)}}}',
        { value: 5 }
      );
      expect(result).toBe('{"product": 15}');
    });

    test("divide - should divide number", () => {
      const result = compileJSONTemplate(
        '{"quotient": {{value | divide(2)}}}',
        { value: 10 }
      );
      expect(result).toBe('{"quotient": 5}');
    });

    test("min - should return minimum", () => {
      const result = compileJSONTemplate('{"min": {{value | min(5)}}}', {
        value: 3,
      });
      expect(result).toBe('{"min": 3}');
    });

    test("max - should return maximum", () => {
      const result = compileJSONTemplate('{"max": {{value | max(5)}}}', {
        value: 8,
      });
      expect(result).toBe('{"max": 8}');
    });
  });

  describe("Validation Filters", () => {
    beforeEach(() => {
      require("../filters/validation-filters").registerValidationFilters();
    });

    test("isEmail - should validate email", () => {
      const result1 = compileJSONTemplate('{"valid": {{email | isEmail}}}', {
        email: "test@example.com",
      });
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate('{"valid": {{email | isEmail}}}', {
        email: "invalid-email",
      });
      expect(result2).toBe('{"valid": false}');
    });

    test("isURL - should validate URL", () => {
      const result1 = compileJSONTemplate('{"valid": {{url | isURL}}}', {
        url: "https://example.com",
      });
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate('{"valid": {{url | isURL}}}', {
        url: "not-a-url",
      });
      expect(result2).toBe('{"valid": false}');
    });

    test("isUUID - should validate UUID", () => {
      const result1 = compileJSONTemplate('{"valid": {{uuid | isUUID}}}', {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate('{"valid": {{uuid | isUUID}}}', {
        uuid: "invalid-uuid",
      });
      expect(result2).toBe('{"valid": false}');
    });

    test("isNumber - should validate number", () => {
      const result1 = compileJSONTemplate('{"valid": {{value | isNumber}}}', {
        value: "123.45",
      });
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate('{"valid": {{value | isNumber}}}', {
        value: "not-a-number",
      });
      expect(result2).toBe('{"valid": false}');
    });

    test("isInteger - should validate integer", () => {
      const result1 = compileJSONTemplate('{"valid": {{value | isInteger}}}', {
        value: "123",
      });
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate('{"valid": {{value | isInteger}}}', {
        value: "123.45",
      });
      expect(result2).toBe('{"valid": false}');
    });

    test("isPhoneNumber - should validate French phone number", () => {
      const result1 = compileJSONTemplate(
        '{"valid": {{phone | isPhoneNumber}}}',
        { phone: "0123456789" }
      );
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate(
        '{"valid": {{phone | isPhoneNumber}}}',
        { phone: "123" }
      );
      expect(result2).toBe('{"valid": false}');
    });

    test("minLength - should check minimum length", () => {
      const result1 = compileJSONTemplate(
        '{"valid": {{text | minLength(5)}}}',
        { text: "hello world" }
      );
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate(
        '{"valid": {{text | minLength(20)}}}',
        { text: "short" }
      );
      expect(result2).toBe('{"valid": false}');
    });

    test("maxLength - should check maximum length", () => {
      const result1 = compileJSONTemplate(
        '{"valid": {{text | maxLength(10)}}}',
        { text: "short" }
      );
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate(
        '{"valid": {{text | maxLength(3)}}}',
        { text: "toolong" }
      );
      expect(result2).toBe('{"valid": false}');
    });

    test("matches - should check regex pattern", () => {
      const result1 = compileJSONTemplate(
        "{\"valid\": {{text | matches('^[A-Z]+$')}}}",
        { text: "HELLO" }
      );
      expect(result1).toBe('{"valid": true}');

      const result2 = compileJSONTemplate(
        "{\"valid\": {{text | matches('^[A-Z]+$')}}}",
        { text: "hello" }
      );
      expect(result2).toBe('{"valid": false}');
    });

    test("base64Encode - should encode to base64", () => {
      const result = compileJSONTemplate(
        '{"encoded": "{{text | base64Encode}}"}',
        { text: "hello" }
      );
      expect(result).toBe('{"encoded": "aGVsbG8="}');
    });

    test("base64Decode - should decode from base64", () => {
      const result = compileJSONTemplate(
        '{"decoded": "{{text | base64Decode}}"}',
        { text: "aGVsbG8=" }
      );
      expect(result).toBe('{"decoded": "hello"}');
    });

    test("escape - should escape HTML", () => {
      const result = compileJSONTemplate('{"escaped": "{{html | escape}}"}', {
        html: '<div class="test">Hello & "world"</div>',
      });
      expect(result).toBe(
        '{"escaped": "&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;world&quot;&lt;/div&gt;"}'
      );
    });

    test("unescape - should unescape HTML", () => {
      const result = compileJSONTemplate(
        '{"unescaped": "{{html | unescape}}"}',
        {
          html: "&lt;div&gt;Hello &amp; world&lt;/div&gt;",
        }
      );
      expect(result).toBe('{"unescaped": "<div>Hello & world</div>"}');
    });

    test("urlEncode - should encode URL", () => {
      const result = compileJSONTemplate(
        '{"encoded": "{{text | urlEncode}}"}',
        { text: "hello world & special chars" }
      );
      expect(result).toBe(
        '{"encoded": "hello%20world%20%26%20special%20chars"}'
      );
    });

    test("urlDecode - should decode URL", () => {
      const result = compileJSONTemplate(
        '{"decoded": "{{text | urlDecode}}"}',
        { text: "hello%20world" }
      );
      expect(result).toBe('{"decoded": "hello world"}');
    });

    test("md5 - should create MD5 hash placeholder", () => {
      const result = compileJSONTemplate('{"hash": "{{text | md5}}"}', {
        text: "hello",
      });
      expect(result).toBe('{"hash": "md5(hello)"}');
    });

    test("sha256 - should create SHA256 hash placeholder", () => {
      const result = compileJSONTemplate('{"hash": "{{text | sha256}}"}', {
        text: "hello",
      });
      expect(result).toBe('{"hash": "sha256(hello)"}');
    });
  });

  describe("Filter Chaining", () => {
    beforeEach(() => {
      require("../filters/number-filters").registerNumberFilters();
      require("../filters/validation-filters").registerValidationFilters();
    });

    test("should chain multiple filters", () => {
      const result = compileJSONTemplate(
        '{"result": "{{name | upper | urlEncode}}"}',
        {
          name: "hello world",
        }
      );
      expect(result).toBe('{"result": "HELLO%20WORLD"}');
    });

    test("should chain with complex operations", () => {
      const result = compileJSONTemplate(
        '{"result": {{value | add(10) | multiply(2) | round(1)}}}',
        {
          value: 5.5,
        }
      );
      expect(result).toBe('{"result": 31}');
    });
  });

  describe("Edge Cases", () => {
    test("should handle null values gracefully", () => {
      const result = compileJSONTemplate(
        '{"text": "{{missing | upper | default(\'FALLBACK\')}}"}',
        {}
      );
      expect(result).toBe('{"text": "FALLBACK"}');
    });

    test("should handle undefined values gracefully", () => {
      const result = compileJSONTemplate(
        '{"length": {{missing | length}}}',
        {}
      );
      expect(result).toBe('{"length": 0}');
    });

    test("should handle invalid filter arguments", () => {
      require("../filters/number-filters").registerNumberFilters();
      const result = compileJSONTemplate('{"result": {{value | add()}}}', {
        value: 5,
      });
      expect(result).toBe('{"result": 5}');
    });
  });

  describe("Custom Filter Registration", () => {
    test("should register and use custom filter", () => {
      registerFilter("exclamation", (value) => `${value}!`);

      const result = compileJSONTemplate(
        '{"text": "{{message | exclamation}}"}',
        {
          message: "Hello World",
        }
      );
      expect(result).toBe('{"text": "Hello World!"}');
    });

    test("should override existing filter", () => {
      registerFilter(
        "upper",
        (value) => `CUSTOM_${String(value).toUpperCase()}`
      );

      const result = compileJSONTemplate('{"text": "{{message | upper}}"}', {
        message: "hello",
      });
      expect(result).toBe('{"text": "CUSTOM_HELLO"}');
    });
  });
});
