// Core templating
export { compileJSONTemplate } from "./json-template.utils";
export { compileAdvancedTemplate } from "./advanced-templating";

// Filter system
export {
  registerFilter,
  getFilter,
  filterRegistry,
  FilterFunction,
} from "./filter-registry";

// Built-in filter modules
export { registerStringFilters, stringFilters } from "./filters/string-filters";
export { registerArrayFilters, arrayFilters } from "./filters/array-filters";
export { registerObjectFilters, objectFilters } from "./filters/object-filters";
export { registerLogicFilters, logicFilters } from "./filters/logic-filters";

// Extended filter modules
export { registerDateFilters, dateFilters } from "./filters/date-filters";
export { registerNumberFilters, numberFilters } from "./filters/number-filters";
export {
  registerValidationFilters,
  validationFilters,
} from "./filters/validation-filters";

// Configuration and error handling
export {
  setTemplateConfig,
  getTemplateConfig,
  TemplateConfig,
  TemplateError,
  TemplateException,
  defaultConfig,
} from "./template-config";

// Performance and caching
export {
  getCachedTemplate,
  setCachedTemplate,
  clearTemplateCache,
  getTemplateStats,
} from "./template-cache";
