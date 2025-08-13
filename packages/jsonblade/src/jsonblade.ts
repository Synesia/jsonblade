import { FilterFunction, getFilter } from "./filter-registry";
import {
  compileJSONTemplate,
  compileJSONTemplateAsync,
  TemplateFunction,
} from "./json-template.utils";
import {
  getTemplateConfig,
  setTemplateConfig,
  TemplateConfig,
} from "./template-config";
import { stringFilters } from "./filters/string-filters";
import { arrayFilters } from "./filters/array-filters";
import { objectFilters } from "./filters/object-filters";
import { logicFilters } from "./filters/logic-filters";

type FilterMap = Record<string, FilterFunction>;

export type JSONBladeOptions = {
  filters?: FilterMap;
  useBuiltins?: boolean;
  config?: Partial<TemplateConfig>;
};

export class JSONBlade {
  private readonly filters: Map<string, FilterFunction> = new Map();

  constructor(options?: JSONBladeOptions) {
    if (options?.filters) {
      for (const [k, v] of Object.entries(options.filters))
        this.filters.set(k, v);
    }
    if (options?.config) setTemplateConfig(options.config);
    if (options?.useBuiltins) {
      const config = getTemplateConfig();
      const mergeGroup = (group: Record<string, FilterFunction>) => {
        Object.entries(group).forEach(([name, builtin]) => {
          const globalOverride = getFilter(name);
          const chosen =
            config.allowFilterOverride && globalOverride
              ? globalOverride
              : builtin;
          this.filters.set(name, chosen);
        });
      };
      mergeGroup(stringFilters);
      mergeGroup(arrayFilters);
      mergeGroup(objectFilters);
      mergeGroup(logicFilters);
    }
  }

  registerFilter(name: string, fn: FilterFunction): void {
    this.filters.set(name, fn);
  }

  compile(template: string, data: any, functions?: TemplateFunction[]): any {
    return compileJSONTemplate(template, data, functions, (name) => {
      return this.filters.get(name);
    });
  }

  compileAsync(
    template: string,
    data: any,
    functions?: TemplateFunction[]
  ): Promise<any> {
    return compileJSONTemplateAsync(template, data, functions, (name) => {
      return this.filters.get(name);
    });
  }

  setConfig(config: Partial<TemplateConfig>): void {
    setTemplateConfig(config);
  }

  getConfig(): TemplateConfig {
    return getTemplateConfig();
  }
}
