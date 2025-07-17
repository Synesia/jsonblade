# JSONBlade - LLM Reference Guide

## Overview

JSONBlade is a powerful JSON template engine for Node.js/TypeScript that enables dynamic JSON generation with filters, conditionals, loops, variables, and advanced templating features.

## Core Concepts

### Template Syntax

- **Variable interpolation**: `{{variableName}}`
- **Filters**: `{{value | filterName}}`
- **Filter chaining**: `{{value | filter1 | filter2}}`
- **Filter arguments**: `{{value | filterName(arg1, arg2)}}`

### Basic Usage

```typescript
import { compileJSONTemplate, compileAdvancedTemplate } from "jsonblade";

// Basic templating
const template = '{"name": "{{user.name | upper}}", "age": {{user.age}}}';
const data = { user: { name: "alice", age: 25 } };
const result = compileJSONTemplate(template, data);
// Result: {"name": "ALICE", "age": 25}

// Advanced templating (with conditionals, loops, variables)
const advancedResult = compileAdvancedTemplate(template, data);
```

## Available Filters

### String Filters

- **upper**: Convert to uppercase `{{name | upper}}`
- **lower**: Convert to lowercase `{{name | lower}}`
- **capitalize**: Capitalize first letter `{{name | capitalize}}`
- **trim**: Remove whitespace `{{text | trim}}`
- **default**: Provide fallback value `{{value | default("fallback")}}`
- **slug**: Convert to URL-friendly slug `{{title | slug}}`

### Array Filters

- **join**: Join array elements `{{items | join(", ")}}`
- **length**: Get array/string/object length `{{items | length}}`
- **first**: Get first element `{{items | first}}`
- **last**: Get last element `{{items | last}}`
- **map**: Extract property from objects `{{users | map(name)}}`
- **filter**: Filter by property value `{{users | filter(active, true)}}`
- **reverse**: Reverse array/string `{{items | reverse}}`
- **sort**: Sort array `{{items | sort}} {{objects | sort(name)}}`
- **unique**: Remove duplicates `{{items | unique}}`

### Object Filters

- **json**: Serialize to JSON `{{object | json}}`
- **keys**: Get object keys `{{object | keys}}`
- **values**: Get object values `{{object | values}}`
- **get**: Get property value `{{object | get(propertyName)}}`
- **has**: Check if property exists `{{object | has(propertyName)}}`
- **entries**: Get key-value pairs `{{object | entries}}`

### Logic Filters

- **equals**: Check equality `{{value | equals(42)}}`
- **not**: Logical negation `{{value | not}}`
- **bool**: Convert to boolean `{{value | bool}}`
- **gt**: Greater than `{{value | gt(10)}}`
- **gte**: Greater than or equal `{{value | gte(10)}}`
- **lt**: Less than `{{value | lt(10)}}`
- **lte**: Less than or equal `{{value | lte(10)}}`
- **contains**: Check if contains `{{text | contains("search")}}`
- **startsWith**: Check if starts with `{{text | startsWith("prefix")}}`
- **endsWith**: Check if ends with `{{text | endsWith("suffix")}}`
- **isEmpty**: Check if empty `{{value | isEmpty}}`

### Date Filters

- **formatDate**: Format date `{{date | formatDate("DD/MM/YYYY")}}`
- **fromNow**: Time from now `{{date | fromNow}}`
- **addDays**: Add days to date `{{date | addDays(7)}}`
- **isoDate**: Convert to ISO format `{{date | isoDate}}`

### Number Filters

- **round**: Round number `{{value | round(2)}}`
- **ceil**: Round up `{{value | ceil}}`
- **floor**: Round down `{{value | floor}}`
- **abs**: Absolute value `{{value | abs}}`
- **currency**: Format as currency `{{price | currency("EUR")}}`
- **percentage**: Format as percentage `{{ratio | percentage}}`
- **multiply**: Multiply `{{value | multiply(2)}}`
- **divide**: Divide `{{value | divide(2)}}`
- **add**: Add `{{value | add(10)}}`
- **subtract**: Subtract `{{value | subtract(5)}}`

### Validation Filters

- **isEmail**: Check if valid email `{{email | isEmail}}`
- **isUrl**: Check if valid URL `{{url | isUrl}}`
- **isNumber**: Check if number `{{value | isNumber}}`
- **encode**: URL encode `{{text | encode}}`
- **decode**: URL decode `{{text | decode}}`

## Advanced Features

### Conditionals

```json
{
  "status": "{{#if user.isActive}}Active{{#else}}Inactive{{/if}}",
  "message": "{{#unless user.isValid}}Invalid user{{/unless}}"
}
```

### Loops

```json
{
  "users": [
    {{#each users}}
    {
      "name": "{{name | capitalize}}",
      "index": {{@index}},
      "isFirst": {{@first}},
      "isLast": {{@last}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

### Variables

```json
{
  {{#set userName = user.name | upper}}
  {{#set userCount = users | length}}
  "greeting": "Hello {{userName}}!",
  "totalUsers": {{userCount}}
}
```

### Comments

```json
{
  {{!-- This is a comment --}}
  "data": "{{value}}"
}
```

## Common Patterns

### User Profile Template

```json
{
  {{#set isVip = user.points | gt(1000)}}
  "profile": {
    "name": "{{user.name | capitalize}}",
    "email": "{{user.email}}",
    "isValid": {{user.email | isEmail}},
    "status": "{{#if isVip}}VIP{{#else}}Regular{{/if}}",
    "joinDate": "{{user.joinDate | formatDate('DD/MM/YYYY')}}",
    "points": "{{user.points | currency('EUR')}}"
  }
}
```

### Product List Template

```json
{
  {{#set hasProducts = products | length | gt(0)}}
  "summary": {
    "total": {{products | length}},
    "hasProducts": {{hasProducts}}
  },
  {{#if hasProducts}}
  "products": [
    {{#each products}}
    {
      "id": {{id}},
      "name": "{{name | capitalize}}",
      "price": "{{price | currency('USD')}}",
      "inStock": {{stock | gt(0)}},
      "category": "{{category | upper}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
  {{/if}}
}
```

### Nested Data Processing

```json
{
  "categories": [
    {{#each categories}}
    {
      "name": "{{name}}",
      "itemCount": {{items | length}},
      "items": [
        {{#each items}}
        {
          "name": "{{name | trim}}",
          "price": {{price | round(2)}},
          "available": {{#if stock > 0}}true{{#else}}false{{/if}}
        }{{#unless @last}},{{/unless}}
        {{/each}}
      ]
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

### Data Aggregation

```json
{
  {{#set totalUsers = users | length}}
  {{#set activeUsers = users | filter(active, true) | length}}
  {{#set inactiveUsers = users | filter(active, false) | length}}

  "statistics": {
    "total": {{totalUsers}},
    "active": {{activeUsers}},
    "inactive": {{inactiveUsers}},
    "activePercentage": "{{activeUsers | divide(totalUsers) | multiply(100) | round(1)}}%"
  },

  "userList": [
    {{#each users}}
    {
      "name": "{{name | capitalize}}",
      "status": "{{#if active}}Active{{#else}}Inactive{{/if}}",
      "lastLogin": "{{lastLogin | formatDate('DD/MM/YYYY') | default('Never')}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

## Advanced API

### Custom Filter Registration

```typescript
import { registerFilter } from "jsonblade";

registerFilter("customFilter", (value, ...args) => {
  // Custom filter logic
  return transformedValue;
});
```

### Template Caching

```typescript
import {
  getCachedTemplate,
  setCachedTemplate,
  clearTemplateCache,
} from "jsonblade";

// Cache compiled template
setCachedTemplate("templateKey", compiledTemplate);

// Retrieve cached template
const cached = getCachedTemplate("templateKey");

// Clear cache
clearTemplateCache();
```

### Configuration

```typescript
import { setTemplateConfig } from "jsonblade";

setTemplateConfig({
  strictMode: true,
  customDelimiters: { start: "[[", end: "]]" },
});
```

## Error Handling

### Graceful Degradation

- Missing properties return `null` or empty values
- Unknown filters are ignored with warnings
- Malformed conditions default to `false`
- Invalid data types are handled gracefully

### Best Practices

1. Use `default` filter for fallback values
2. Chain filters for complex transformations
3. Use variables for repeated calculations
4. Test with empty/null data
5. Validate input data before templating

## Performance Tips

1. Use template caching for repeated templates
2. Minimize deep object access
3. Use specific filters instead of complex logic
4. Pre-process data when possible
5. Avoid deeply nested loops

## Common Use Cases

- API response formatting
- Email template generation
- Configuration file generation
- Report generation
- Data transformation
- Dashboard data preparation
- Export formats (CSV, XML via JSON)
