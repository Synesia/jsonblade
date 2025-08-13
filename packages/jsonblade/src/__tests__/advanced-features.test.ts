import { registerFilter } from "../index";
import { JSONBlade } from "../jsonblade";
import {
  setTemplateConfig,
  getTemplateConfig,
  TemplateException,
  defaultConfig,
} from "../template-config";
// cache removed

import { registerDateFilters } from "../filters/date-filters";
import { registerNumberFilters } from "../filters/number-filters";
import { registerValidationFilters } from "../filters/validation-filters";

describe("Advanced Features", () => {
  beforeEach(() => {
    setTemplateConfig(defaultConfig);
    // cache removed
    registerDateFilters();
    registerNumberFilters();
    registerValidationFilters();
  });

  describe("Configuration System", () => {
    test("should support strict mode configuration", () => {
      setTemplateConfig({ strictMode: true, throwOnError: true });

      const jb = new JSONBlade({ useBuiltins: true });
      expect(() => {
        jb.compile('{"value": "{{name | unknownFilter}}"}', { name: "test" });
      }).toThrow(TemplateException);
    });

    test("should allow custom delimiters", () => {
      setTemplateConfig({ delimiters: { start: "[[", end: "]]" } });
      const config = getTemplateConfig();

      expect(config.delimiters.start).toBe("[[");
      expect(config.delimiters.end).toBe("]]");
    });
  });

  describe("Date Filters", () => {
    test("should format dates correctly", () => {
      const template = `{"date": "{{date | formatDate(DD/MM/YYYY)}}"}`;
      const data = { date: "2023-12-25T10:30:00Z" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.date).toContain("25/12/2023");
    });

    test("should calculate time from now", () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const template = `{"timeAgo": "{{date | fromNow}}"}`;
      const data = { date: pastDate.toISOString() };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.timeAgo).toContain("2 hours ago");
    });

    test("should add days to date", () => {
      const template = `{"futureDate": "{{date | addDays(7) | formatDate(YYYY-MM-DD)}}"}`;
      const data = { date: "2023-12-25" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.futureDate).toContain("2024-01-01");
    });
  });

  describe("Number Filters", () => {
    test("should format currency", () => {
      const template = `{"price": "{{amount | currency(EUR)}}"}`;
      const data = { amount: 1234.56 };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.price).toBe("1 234,56 €");
    });

    test("should calculate percentages", () => {
      const template = `{"rate": "{{ratio | percentage(1)}}"}`;
      const data = { ratio: 0.1234 };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.rate).toContain("12.3%");
    });

    test("should perform math operations", () => {
      const template = `{
        "sum": {{value | add(10)}},
        "product": {{value | multiply(2)}},
        "rounded": {{value | round(2)}}
      }`;
      const data = { value: 12.3456 };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.sum).toBe(22.3456);
      expect(result.product).toBe(24.6912);
      expect(result.rounded).toBe(12.35);
    });
  });

  describe("Validation Filters", () => {
    test("should validate email addresses", () => {
      const template = `{
        "validEmail": {{email1 | isEmail}},
        "invalidEmail": {{email2 | isEmail}}
      }`;
      const data = {
        email1: "test@example.com",
        email2: "invalid-email",
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.validEmail).toBe(true);
      expect(result.invalidEmail).toBe(false);
    });

    test("should encode and decode strings", () => {
      const template = `{
        "encoded": "{{text | base64Encode}}",
        "escaped": "{{html | escape}}"
      }`;
      const data = {
        text: "Hello World",
        html: '<script>alert("xss")</script>',
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.encoded).toBe("SGVsbG8gV29ybGQ=");
      expect(result.escaped).toContain("&lt;script&gt;");
    });
  });

  // Cache tests removed

  describe("Advanced Templating", () => {
    test("should handle if conditions", () => {
      const template = `{
        "message": "{{#if user.isActive}}Active User{{/if}}"
      }`;
      const data = { user: { isActive: true } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.message).toBe("Active User");
    });

    test("should handle if-else conditions", () => {
      const template = `{
        "status": "{{#if user.isActive}}Active{{#else}}Inactive{{/if}}"
      }`;
      const data = { user: { isActive: false } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.status).toBe("Inactive");
    });

    test("should handle loops", () => {
      const template = `{
        "items": [
          {{#each users}}
          {
            "name": "{{name}}",
            "index": {{@index}},
            "isFirst": {{@first}}
          }{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      }`;
      const data = {
        users: [{ name: "Alice" }, { name: "Bob" }],
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.items[0].name).toBe("Alice");
      expect(result.items[0].index).toBe(0);
      expect(result.items[0].isFirst).toBe(true);
    });

    test("should handle variables", () => {
      const template = `{
        {{#set totalUsers = users.length}}
        "userCount": {{totalUsers}},
        "message": "We have {{totalUsers}} users"
      }`;
      const data = { users: [{}, {}, {}] };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.userCount).toBe(3);
      expect(result.message).toBe("We have 3 users");
    });

    test("should handle comments", () => {
      const template = `{
        {{!-- This is a comment --}}
        "value": "test"
        {{!-- Another comment --}}
      }`;
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, {});

      expect(JSON.stringify(result)).not.toContain("This is a comment");
      expect(result.value).toBe("test");
    });
  });

  describe("Complex Integration", () => {
    test("should combine multiple advanced features", () => {
      const template = `{
        {{!-- User profile template --}}
        {{#set isVip = user.points | gt(1000)}}
        "profile": {
          "name": "{{user.name | capitalize}}",
          "email": "{{user.email}}",
          "isValid": {{user.email | isEmail}},
          "points": {{user.points | currency('EUR')}},
          "status": "{{#if isVip}}VIP Member{{#else}}Regular Member{{/if}}",
          "joinDate": "{{user.joinDate | formatDate('DD/MM/YYYY')}}",
          "badges": [
            {{#each user.badges}}
            "{{name | upper}}"{{#unless @last}},{{/unless}}
            {{/each}}
          ]
        }
      }`;

      const data = {
        user: {
          name: "alice smith",
          email: "alice@example.com",
          points: 1500,
          joinDate: "2023-01-15T10:00:00Z",
          badges: [{ name: "early adopter" }, { name: "contributor" }],
        },
      };

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.profile.name).toBe("Alice smith");
      expect(result.profile.isValid).toBe(true);
      expect(result.profile.status).toBe("VIP Member");
      expect(result.profile.joinDate).toBe("15/01/2023");
      expect(result.profile.badges).toContain("EARLY ADOPTER");
    });
  });
});
