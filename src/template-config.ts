export interface TemplateConfig {
  strictMode: boolean;
  throwOnError: boolean;
  allowFilterOverride: boolean;
  delimiters: {
    start: string;
    end: string;
  };
  debug: boolean;
}

export interface TemplateError {
  type:
    | "UNKNOWN_FILTER"
    | "INVALID_SYNTAX"
    | "FILTER_ERROR"
    | "EVALUATION_ERROR";
  message: string;
  filter?: string;
  expression?: string;
  position?: number;
}

export class TemplateException extends Error {
  constructor(
    public readonly templateError: TemplateError,
    public readonly template?: string
  ) {
    super(templateError.message);
    this.name = "TemplateException";
  }
}

export const defaultConfig: TemplateConfig = {
  strictMode: false,
  throwOnError: false,
  allowFilterOverride: true,
  delimiters: {
    start: "{{",
    end: "}}",
  },
  debug: false,
};

let globalConfig: TemplateConfig = { ...defaultConfig };

export function setTemplateConfig(config: Partial<TemplateConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

export function getTemplateConfig(): TemplateConfig {
  return { ...globalConfig };
}

export function createTemplateError(
  type: TemplateError["type"],
  message: string,
  details?: Partial<TemplateError>
): TemplateError {
  return {
    type,
    message,
    ...details,
  };
}

export function handleTemplateError(
  error: TemplateError,
  config: TemplateConfig
): void {
  if (config.debug) {
    console.debug("Template Error:", error);
  }

  if (config.throwOnError) {
    throw new TemplateException(error);
  } else {
    console.warn(`Template Warning [${error.type}]: ${error.message}`);
  }
}
