import {
  registerFilter,
  getFilter,
  filterRegistry,
  registerStringFilters,
  registerArrayFilters,
  registerObjectFilters,
  registerLogicFilters,
} from "../index";
import { JSONBlade } from "../jsonblade";

describe("Modular Filter API", () => {
  beforeAll(() => {
    // Initialize all built-in filters
    registerStringFilters();
    registerArrayFilters();
    registerObjectFilters();
    registerLogicFilters();
  });

  beforeEach(() => {
    filterRegistry.unregisterFilter("testFilter");
    filterRegistry.unregisterFilter("multiArgFilter");
  });

  describe("registerFilter function", () => {
    test("should register a new filter", () => {
      registerFilter("testFilter", (value) => `test-${value}`);

      const template = `{"result": "{{name | testFilter}}"}`;
      const data = { name: "alice" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({ result: "test-alice" });
    });

    test("should register filter with multiple arguments", () => {
      registerFilter("multiArgFilter", (value, prefix, suffix) => {
        return `${prefix || ""}${value}${suffix || ""}`;
      });

      const template = `{"result": "{{name | multiArgFilter([, ])}}"}`;
      const data = { name: "alice" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({ result: "[alice]" });
    });

    test("should override existing filter", () => {
      registerFilter(
        "upper",
        (value) => `CUSTOM-${String(value).toUpperCase()}`
      );

      const template = `{"result": "{{name | upper}}"}`;
      const data = { name: "alice" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({ result: "CUSTOM-ALICE" });
    });
  });

  describe("getFilter function", () => {
    test("should retrieve registered filter", () => {
      registerFilter("testFilter", (value) => `test-${value}`);

      const filter = getFilter("testFilter");
      expect(filter).toBeDefined();
      expect(filter!("hello")).toBe("test-hello");
    });

    test("should return undefined for non-existent filter", () => {
      const filter = getFilter("nonExistentFilter");
      expect(filter).toBeUndefined();
    });
  });

  describe("filterRegistry", () => {
    test("should check if filter exists", () => {
      registerFilter("testFilter", (value) => value);

      expect(filterRegistry.hasFilter("testFilter")).toBe(true);
      expect(filterRegistry.hasFilter("nonExistent")).toBe(false);
    });

    test("should unregister filter", () => {
      registerFilter("testFilter", (value) => value);
      expect(filterRegistry.hasFilter("testFilter")).toBe(true);

      const removed = filterRegistry.unregisterFilter("testFilter");
      expect(removed).toBe(true);
      expect(filterRegistry.hasFilter("testFilter")).toBe(false);
    });

    test("should register multiple filters at once", () => {
      const filters = {
        filter1: (value: any) => `f1-${value}`,
        filter2: (value: any) => `f2-${value}`,
      };

      filterRegistry.registerFilters(filters);

      expect(filterRegistry.hasFilter("filter1")).toBe(true);
      expect(filterRegistry.hasFilter("filter2")).toBe(true);
    });
  });

  describe("Built-in filter modules", () => {
    test("should have string filters available", () => {
      expect(getFilter("upper")).toBeDefined();
      expect(getFilter("lower")).toBeDefined();
      expect(getFilter("capitalize")).toBeDefined();
      expect(getFilter("trim")).toBeDefined();
      expect(getFilter("slug")).toBeDefined();
    });

    test("should have array filters available", () => {
      expect(getFilter("join")).toBeDefined();
      expect(getFilter("length")).toBeDefined();
      expect(getFilter("first")).toBeDefined();
      expect(getFilter("last")).toBeDefined();
      expect(getFilter("map")).toBeDefined();
      expect(getFilter("filter")).toBeDefined();
      expect(getFilter("reverse")).toBeDefined();
      expect(getFilter("sort")).toBeDefined();
      expect(getFilter("unique")).toBeDefined();
    });

    test("should have object filters available", () => {
      expect(getFilter("json")).toBeDefined();
      expect(getFilter("keys")).toBeDefined();
      expect(getFilter("values")).toBeDefined();
      expect(getFilter("get")).toBeDefined();
      expect(getFilter("has")).toBeDefined();
      expect(getFilter("entries")).toBeDefined();
    });

    test("should have logic filters available", () => {
      expect(getFilter("equals")).toBeDefined();
      expect(getFilter("not")).toBeDefined();
      expect(getFilter("bool")).toBeDefined();
      expect(getFilter("gt")).toBeDefined();
      expect(getFilter("gte")).toBeDefined();
      expect(getFilter("lt")).toBeDefined();
      expect(getFilter("lte")).toBeDefined();
      expect(getFilter("contains")).toBeDefined();
      expect(getFilter("startsWith")).toBeDefined();
      expect(getFilter("endsWith")).toBeDefined();
      expect(getFilter("isEmpty")).toBeDefined();
    });
  });

  describe("New filters functionality", () => {
    test("should use slug filter", () => {
      const template = `{"slug": "{{title | slug}}"}`;
      const data = { title: "Hello World & More!" };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({ slug: "hello-world-more" });
    });

    test("should use new array filters", () => {
      const template = `{
        "reversed": {{items | reverse}},
        "sorted": {{names | sort}},
        "unique": {{numbers | unique}}
      }`;
      const data = {
        items: [1, 2, 3],
        names: ["charlie", "alice", "bob"],
        numbers: [1, 2, 2, 3, 1],
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({
        reversed: [3, 2, 1],
        sorted: ["alice", "bob", "charlie"],
        unique: [1, 2, 3],
      });
    });

    test("should use new logic filters", () => {
      const template = `{
        "isAdult": {{age | gte(18)}},
        "isEmpty": {{items | isEmpty}},
        "contains": {{text | contains(hello)}}
      }`;
      const data = {
        age: 25,
        items: [],
        text: "hello world",
      };
      const jb = new JSONBlade({ useBuiltins: true });
      const result = jb.compile(template, data);

      expect(result).toEqual({
        isAdult: true,
        isEmpty: true,
        contains: true,
      });
    });
  });
});
