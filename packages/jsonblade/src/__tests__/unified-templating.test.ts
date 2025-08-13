import { JSONBlade } from "../jsonblade";

describe("Unified JSON Template Compilation", () => {
  describe("Basic Interpolation", () => {
    test("should interpolate simple values", () => {
      const template = `{
        "name": "{{user.name}}",
        "age": {{user.age}},
        "active": {{user.active}}
      }`;
      const data = { user: { name: "Alice", age: 25, active: true } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({
        name: "Alice",
        age: 25,
        active: true,
      });
    });

    test("should handle missing values gracefully", () => {
      const template = `{
        "name": "{{user.name}}",
        "missing": "{{user.missing}}"
      }`;
      const data = { user: { name: "Alice" } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({
        name: "Alice",
        missing: "",
      });
    });
  });

  describe("Conditional Logic", () => {
    test("should handle if/else conditions", () => {
      const template = `{
        "message": "{{#if user.isActive}}Hello{{#else}}NOP{{/if}}"
      }`;

      const activeData = { user: { isActive: true } };
      const inactiveData = { user: { isActive: false } };

      const jb = new JSONBlade({ useBuiltins: true });
      const activeResult = jb.compile(template, activeData);
      const inactiveResult = jb.compile(template, inactiveData);

      expect(activeResult.message).toBe("Hello");
      expect(inactiveResult.message).toBe("NOP");
    });

    test("should handle simple if conditions", () => {
      const template = `{
        "message": "{{#if showGreeting}}Hello World!{{/if}}"
      }`;

      const showData = { showGreeting: true };
      const hideData = { showGreeting: false };

      const jb = new JSONBlade({ useBuiltins: true });
      const showResult = jb.compile(template, showData);
      const hideResult = jb.compile(template, hideData);

      expect(showResult.message).toBe("Hello World!");
      expect(hideResult.message).toBe("");
    });

    test("should handle unless conditions", () => {
      const template = `{
        "error": "{{#unless user.isValid}}Invalid user{{/unless}}"
      }`;

      const validData = { user: { isValid: true } };
      const invalidData = { user: { isValid: false } };

      const jb = new JSONBlade({ useBuiltins: true });
      const validResult = jb.compile(template, validData);
      const invalidResult = jb.compile(template, invalidData);

      expect(validResult.error).toBe("");
      expect(invalidResult.error).toBe("Invalid user");
    });
  });

  describe("Loops", () => {
    test("should handle each loops", () => {
      const template = `{
        "users": [
          {{#each users}}
          {
            "name": "{{name}}",
            "index": {{@index}},
            "isFirst": {{@first}},
            "isLast": {{@last}}
          }{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      }`;

      const data = {
        users: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }],
      };

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.users).toHaveLength(3);
      expect(result.users[0].name).toBe("Alice");
      expect(result.users[0].index).toBe(0);
      expect(result.users[0].isFirst).toBe(true);
      expect(result.users[0].isLast).toBe(false);
      expect(result.users[2].isLast).toBe(true);
    });

    test("should handle nested conditions in loops", () => {
      const template = `{
        "users": [
          {{#each users}}
          {
            "name": "{{name}}",
            "status": "{{#if active}}Active{{#else}}Inactive{{/if}}"
          }{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      }`;

      const data = {
        users: [
          { name: "Alice", active: true },
          { name: "Bob", active: false },
        ],
      };

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.users[0].status).toBe("Active");
      expect(result.users[1].status).toBe("Inactive");
    });

    test("should handle empty arrays", () => {
      const template = `{
        "users": [
          {{#each users}}
          "{{this}}"{{#unless @last}},{{/unless}}
          {{/each}}
        ]
      }`;

      const data = { users: [] };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.users).toEqual([]);
    });
  });

  describe("Variables", () => {
    test("should handle set variables", () => {
      const template = `{
        {{#set totalUsers = users | length}}
        "summary": {
          "total": {{totalUsers}},
          "message": "Found {{totalUsers}} users"
        }
      }`;

      const data = { users: [{}, {}, {}] };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.summary.total).toBe(3);
      expect(result.summary.message).toBe("Found 3 users");
    });

    test("should handle variables with filters", () => {
      const template = `{
        {{#set userName = user.name | upper}}
        "greeting": "Hello {{userName}}!"
      }`;

      const data = { user: { name: "alice" } };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.greeting).toBe("Hello ALICE!");
    });
  });

  describe("Comments", () => {
    test("should remove comments from template", () => {
      const template = `{
        {{!-- This is a comment --}}
        "name": "{{name}}",
        {{!-- Another comment --}}
        "age": {{age}}
      }`;
      const data = { name: "Alice", age: 30 };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(JSON.stringify(result)).not.toContain("This is a comment");
      expect(JSON.stringify(result)).not.toContain("Another comment");
      expect(result.name).toBe("Alice");
      expect(result.age).toBe(30);
    });
  });

  describe("Filters", () => {
    test("should apply filters correctly", () => {
      const template = `{
        "name": "{{user.name | upper}}",
        "email": "{{user.email | lower}}",
        "count": {{items | length}},
        "first": "{{items | first}}"
      }`;

      const data = {
        user: { name: "alice", email: "ALICE@EXAMPLE.COM" },
        items: ["one", "two", "three"],
      };

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.name).toBe("ALICE");
      expect(result.email).toBe("alice@example.com");
      expect(result.count).toBe(3);
      expect(result.first).toBe("one");
    });
  });

  describe("Complex Integration", () => {
    test("should combine all features", () => {
      const template = `{
        {{!-- User profile template --}}
        {{#set isVip = user.points | gt(1000)}}
        "profile": {
          "name": "{{user.name | capitalize}}",
          "email": "{{user.email}}",
          "isValid": {{user.email | isEmail}},
          "status": "{{#if isVip}}VIP Member{{#else}}Regular Member{{/if}}",
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
          badges: [{ name: "early adopter" }, { name: "contributor" }],
        },
      };

      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result.profile.name).toBe("Alice smith");
      expect(result.profile.isValid).toBe(true);
      expect(result.profile.status).toBe("VIP Member");
      expect(result.profile.badges).toContain("EARLY ADOPTER");
    });
  });
});
