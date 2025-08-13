import { registerFilter } from "../index";
import { JSONBlade } from "../jsonblade";

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
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{value | upper}}"}', {
        value: "hello world",
      });
      expect(result).toEqual({ text: "HELLO WORLD" });
    });

    test("lower - should convert to lowercase", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{value | lower}}"}', {
        value: "HELLO WORLD",
      });
      expect(result).toEqual({ text: "hello world" });
    });

    test("capitalize - should capitalize first letter", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{value | capitalize}}"}', {
        value: "hello world",
      });
      expect(result).toEqual({ text: "Hello world" });
    });

    test("default - should use default value when empty", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"text": "{{missing | default(\'fallback\')}}"}',
        {}
      );
      expect(result).toEqual({ text: "fallback" });
    });

    test("default - should use original value when present", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"text": "{{value | default(\'fallback\')}}"}',
        { value: "original" }
      );
      expect(result).toEqual({ text: "original" });
    });

    test("trim - should remove leading and trailing whitespace", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{value | trim}}"}', {
        value: "  hello  ",
      });
      expect(result).toEqual({ text: "hello" });
    });
  });

  describe("Array Filters", () => {
    test("join - should join array with default separator", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{items | join}}"}', {
        items: ["a", "b", "c"],
      });
      expect(result).toEqual({ text: "a,b,c" });
    });

    test("join - should join array with custom separator", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{items | join(\'-\')}}"}', {
        items: ["a", "b", "c"],
      });
      expect(result).toEqual({ text: "a-b-c" });
    });

    test("length - should return array length", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"count": {{items | length}}}', {
        items: [1, 2, 3, 4],
      });
      expect(result).toEqual({ count: 4 });
    });

    test("length - should return string length", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"count": {{text | length}}}', {
        text: "hello",
      });
      expect(result).toEqual({ count: 5 });
    });

    test("length - should return object length", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"count": {{obj | length}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toEqual({ count: 2 });
    });

    test("first - should return first element", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"first": "{{items | first}}"}', {
        items: ["apple", "banana"],
      });
      expect(result).toEqual({ first: "apple" });
    });

    test("last - should return last element", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"last": "{{items | last}}"}', {
        items: ["apple", "banana"],
      });
      expect(result).toEqual({ last: "banana" });
    });

    test("map - should map object property", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"names": {{users | map(name)}}}', {
        users: [{ name: "Alice" }, { name: "Bob" }],
      });
      expect(result).toEqual({ names: ["Alice", "Bob"] });
    });

    test("filter - should filter by property value", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"active": {{users | filter(active, true) | length}}}',
        {
          users: [{ active: true }, { active: false }, { active: true }],
        }
      );
      expect(result).toEqual({ active: 2 });
    });
  });

  describe("Object Filters", () => {
    test("json - should serialize to JSON", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"data": "{{obj | json}}"}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toEqual({ data: '{"a":1,"b":2}' });
    });

    test("keys - should return object keys", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"keys": {{obj | keys}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toEqual({ keys: ["a", "b"] });
    });

    test("values - should return object values", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"values": {{obj | values}}}', {
        obj: { a: 1, b: 2 },
      });
      expect(result).toEqual({ values: [1, 2] });
    });

    test("get - should get object property", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"value": {{obj | get(a)}}}', {
        obj: { a: 42, b: 2 },
      });
      expect(result).toEqual({ value: 42 });
    });
  });

  describe("Logic Filters", () => {
    test("equals - should compare values", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"same": {{value | equals(42)}}}', {
        value: 42,
      });
      expect(result).toEqual({ same: true });
    });

    test("not - should negate boolean", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"opposite": {{value | not}}}', {
        value: true,
      });
      expect(result).toEqual({ opposite: false });
    });

    test("bool - should convert to boolean", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"bool": {{value | bool}}}', {
        value: "hello",
      });
      expect(result).toEqual({ bool: true });
    });

    test("gt - should check greater than", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"greater": {{value | gt(10)}}}', {
        value: 15,
      });
      expect(result).toEqual({ greater: true });
    });

    test("gte - should check greater than or equal", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"gte": {{value | gte(10)}}}', {
        value: 10,
      });
      expect(result).toEqual({ gte: true });
    });

    test("lt - should check less than", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"less": {{value | lt(10)}}}', {
        value: 5,
      });
      expect(result).toEqual({ less: true });
    });

    test("lte - should check less than or equal", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"lte": {{value | lte(10)}}}', {
        value: 10,
      });
      expect(result).toEqual({ lte: true });
    });
  });

  describe("Date Filters", () => {
    beforeEach(() => {
      require("../filters/date-filters").registerDateFilters();
    });

    test("formatDate - should format date with pattern", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"date": "{{date | formatDate(DD/MM/YYYY)}}"}',
        {
          date: "2023-01-15T10:00:00Z",
        }
      );
      expect(result).toEqual({ date: "15/01/2023" });
    });

    test("fromNow - should calculate relative time", () => {
      const now = new Date().toISOString();
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"relative": "{{date | fromNow}}"}', {
        date: now,
      });
      expect(result.relative).toContain("just now");
    });

    test("addDays - should add days to date", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"future": "{{date | addDays(7) | formatDate(DD/MM/YYYY)}}"}',
        {
          date: "2023-01-15T10:00:00Z",
        }
      );
      expect(result).toEqual({ future: "22/01/2023" });
    });

    test("isoDate - should convert to ISO format", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"iso": "{{date | isoDate}}"}', {
        date: "15/01/2023",
      });
      expect(result).toEqual({ iso: "2023-01-15T00:00:00.000Z" });
    });

    test("timestamp - should convert to timestamp", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"ts": {{date | timestamp}}}', {
        date: "2023-01-01T00:00:00Z",
      });
      expect(result).toEqual({ ts: 1672531200000 });
    });
  });

  describe("Number Filters", () => {
    beforeEach(() => {
      require("../filters/number-filters").registerNumberFilters();
    });

    test("round - should round to specified decimals", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"rounded": {{value | round(2)}}}', {
        value: 3.14159,
      });
      expect(result).toEqual({ rounded: 3.14 });
    });

    test("ceil - should round up", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"ceil": {{value | ceil}}}', {
        value: 3.14,
      });
      expect(result).toEqual({ ceil: 4 });
    });

    test("floor - should round down", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"floor": {{value | floor}}}', {
        value: 3.14,
      });
      expect(result).toEqual({ floor: 3 });
    });

    test("abs - should return absolute value", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"abs": {{value | abs}}}', {
        value: -42,
      });
      expect(result).toEqual({ abs: 42 });
    });

    test("currency - should format as currency", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"price": "{{amount | currency(EUR)}}"}', {
        amount: 1234.56,
      });
      expect(result).toEqual({ price: "1 234,56 €" });
    });

    test("percentage - should format as percentage", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"percent": "{{ratio | percentage(1)}}"}', {
        ratio: 0.756,
      });
      expect(result).toEqual({ percent: "75.6%" });
    });

    test("add - should add number", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"sum": {{value | add(10)}}}', {
        value: 5,
      });
      expect(result).toEqual({ sum: 15 });
    });

    test("subtract - should subtract number", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"diff": {{value | subtract(3)}}}', {
        value: 10,
      });
      expect(result).toEqual({ diff: 7 });
    });

    test("multiply - should multiply number", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"product": {{value | multiply(3)}}}', {
        value: 5,
      });
      expect(result).toEqual({ product: 15 });
    });

    test("divide - should divide number", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"quotient": {{value | divide(2)}}}', {
        value: 10,
      });
      expect(result).toEqual({ quotient: 5 });
    });

    test("min - should return minimum", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"min": {{value | min(5)}}}', {
        value: 3,
      });
      expect(result).toEqual({ min: 3 });
    });

    test("max - should return maximum", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"max": {{value | max(5)}}}', {
        value: 8,
      });
      expect(result).toEqual({ max: 8 });
    });
  });

  describe("Validation Filters", () => {
    beforeEach(() => {
      require("../filters/validation-filters").registerValidationFilters();
    });

    test("isEmail - should validate email", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{email | isEmail}}}', {
        email: "test@example.com",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{email | isEmail}}}', {
        email: "invalid-email",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("isURL - should validate URL", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{url | isURL}}}', {
        url: "https://example.com",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{url | isURL}}}', {
        url: "not-a-url",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("isUUID - should validate UUID", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{uuid | isUUID}}}', {
        uuid: "123e4567-e89b-12d3-a456-426614174000",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{uuid | isUUID}}}', {
        uuid: "invalid-uuid",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("isNumber - should validate number", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{value | isNumber}}}', {
        value: "123.45",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{value | isNumber}}}', {
        value: "not-a-number",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("isInteger - should validate integer", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{value | isInteger}}}', {
        value: "123",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{value | isInteger}}}', {
        value: "123.45",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("isPhoneNumber - should validate French phone number", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{phone | isPhoneNumber}}}', {
        phone: "0123456789",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{phone | isPhoneNumber}}}', {
        phone: "123",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("minLength - should check minimum length", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{text | minLength(5)}}}', {
        text: "hello world",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{text | minLength(20)}}}', {
        text: "short",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("maxLength - should check maximum length", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{text | maxLength(10)}}}', {
        text: "short",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{text | maxLength(3)}}}', {
        text: "toolong",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("matches - should check regex pattern", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result1 = jb.compile('{"valid": {{text | matches(^[A-Z]+$)}}}', {
        text: "HELLO",
      });
      expect(result1).toEqual({ valid: true });

      const result2 = jb.compile('{"valid": {{text | matches(^[A-Z]+$)}}}', {
        text: "hello",
      });
      expect(result2).toEqual({ valid: false });
    });

    test("base64Encode - should encode to base64", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"encoded": "{{text | base64Encode}}"}', {
        text: "hello",
      });
      expect(result).toEqual({ encoded: "aGVsbG8=" });
    });

    test("base64Decode - should decode from base64", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"decoded": "{{text | base64Decode}}"}', {
        text: "aGVsbG8=",
      });
      expect(result).toEqual({ decoded: "hello" });
    });

    test("escape - should escape HTML", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"escaped": "{{html | escape}}"}', {
        html: '<div class="test">Hello & "world"</div>',
      });
      expect(result).toEqual({
        escaped:
          "&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;world&quot;&lt;/div&gt;",
      });
    });

    test("unescape - should unescape HTML", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"unescaped": "{{html | unescape}}"}', {
        html: "&lt;div&gt;Hello &amp; world&lt;/div&gt;",
      });
      expect(result).toEqual({ unescaped: "<div>Hello & world</div>" });
    });

    test("urlEncode - should encode URL", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"encoded": "{{text | urlEncode}}"}', {
        text: "hello world & special chars",
      });
      expect(result).toEqual({
        encoded: "hello%20world%20%26%20special%20chars",
      });
    });

    test("urlDecode - should decode URL", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"decoded": "{{text | urlDecode}}"}', {
        text: "hello%20world",
      });
      expect(result).toEqual({ decoded: "hello world" });
    });

    test("md5 - should create MD5 hash placeholder", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"hash": "{{text | md5}}"}', {
        text: "hello",
      });
      expect(result).toEqual({ hash: "md5(hello)" });
    });

    test("sha256 - should create SHA256 hash placeholder", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"hash": "{{text | sha256}}"}', {
        text: "hello",
      });
      expect(result).toEqual({ hash: "sha256(hello)" });
    });
  });

  describe("Filter Chaining", () => {
    beforeEach(() => {
      require("../filters/number-filters").registerNumberFilters();
      require("../filters/validation-filters").registerValidationFilters();
    });

    test("should chain multiple filters", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"result": "{{name | upper | urlEncode}}"}', {
        name: "hello world",
      });
      expect(result).toEqual({ result: "HELLO%20WORLD" });
    });

    test("should chain with complex operations", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"result": {{value | add(10) | multiply(2) | round(1)}}}',
        {
          value: 5.5,
        }
      );
      expect(result).toEqual({ result: 31 });
    });
  });

  describe("Edge Cases", () => {
    test("should handle null values gracefully", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(
        '{"text": "{{missing | upper | default(FALLBACK)}}"}',
        {}
      );
      expect(result).toEqual({ text: "FALLBACK" });
    });

    test("should handle undefined values gracefully", () => {
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"length": {{missing | length}}}', {});
      expect(result).toEqual({ length: 0 });
    });

    test("should handle invalid filter arguments", () => {
      require("../filters/number-filters").registerNumberFilters();
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"result": {{value | add()}}}', {
        value: 5,
      });
      expect(result).toEqual({ result: 5 });
    });
  });

  describe("Custom Filter Registration", () => {
    test("should register and use custom filter", () => {
      registerFilter("exclamation", (value) => `${value}!`);

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{message | exclamation}}"}', {
        message: "Hello World",
      });
      expect(result).toEqual({ text: "Hello World!" });
    });

    test("should override existing filter", () => {
      registerFilter(
        "upper",
        (value) => `CUSTOM_${String(value).toUpperCase()}`
      );

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile('{"text": "{{message | upper}}"}', {
        message: "hello",
      });
      expect(result).toEqual({ text: "CUSTOM_HELLO" });
    });
  });
});
