# 🗡️ JSONBlade

**A sharp and modular JSON template engine with an extensible filter system.**

_Slice your data with precision, forge your templates with elegance._

[![npm version](https://img.shields.io/npm/v/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-100%2B-green.svg)](./src/__tests__)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **42+ built-in filters** - Strings, arrays, objects, dates, numbers, validation
- 🔧 **Modular API** - `registerFilter()` to add your own filters
- ⚡ **Smart caching** - Optimized performance with LRU cache
- 🔀 **Advanced templating** - Conditions, loops, variables, comments
- 🛡️ **Error handling** - Flexible configuration and typed exceptions
- 📝 **Native TypeScript** - Full support with types and autocompletion
- 🎨 **Intuitive syntax** - Easy to learn and use

## Installation

```bash
npm install jsonblade
```

## ⚡ Quick Start

```typescript
import { compileJSONTemplate, registerFilter } from "jsonblade";

// Template with built-in filters
const template = `{
  "greeting": "Hello {{name | capitalize}}!",
  "price": "{{amount | currency('EUR')}}",
  "created": "{{date | formatDate('DD/MM/YYYY')}}"
}`;

const data = {
  name: "alice",
  amount: 29.99,
  date: "2024-01-15",
};

console.log(compileJSONTemplate(template, data));
// → {"greeting": "Hello Alice!", "price": "29,99 €", "created": "15/01/2024"}

// Add a custom filter
registerFilter("shout", (text) => `${text}!!!`);

const result = compileJSONTemplate('{"msg": "{{text | shout}}"}', {
  text: "Hello",
});
// → {"msg": "Hello!!!"}
```

## Basic Usage

```typescript
import { compileJSONTemplate } from "jsonblade";

const template = `{
  "greeting": "Hello {{name | capitalize}}!",
  "count": {{items | length}}
}`;

const data = {
  name: "alice",
  items: [1, 2, 3],
};

console.log(compileJSONTemplate(template, data));
// Output: {"greeting": "Hello Alice!", "count": 3}
```

## Modular API

### Custom Filter Registration

```typescript
import { registerFilter } from "jsonblade";

// Simple filter
registerFilter("reverse", (value) => {
  return String(value).split("").reverse().join("");
});

// Filter with arguments
registerFilter("truncate", (value, length = 10) => {
  const str = String(value);
  return str.length > length ? str.substring(0, length) + "..." : str;
});

// Usage
const template = `{
  "reversed": "{{text | reverse}}",
  "short": "{{description | truncate(15)}}"
}`;
```

### Filter Registry Management

```typescript
import { filterRegistry, getFilter } from "jsonblade";

// Check if a filter exists
filterRegistry.hasFilter("upper"); // true

// Get a filter
const upperFilter = getFilter("upper");

// Remove a filter
filterRegistry.unregisterFilter("upper");

// Register multiple filters
filterRegistry.registerFilters({
  double: (v) => Number(v) * 2,
  square: (v) => Number(v) ** 2,
});
```

## Built-in Filters

### String Filters

- `upper` - Convert to uppercase
- `lower` - Convert to lowercase
- `capitalize` - Capitalize first letter
- `trim` - Remove whitespace
- `default(value)` - Default value if null/empty
- `slug` - Convert to URL-friendly slug

```typescript
"{{title | slug}}"; // "Hello World!" → "hello-world"
"{{name | default('Anonymous')}}"; // null → "Anonymous"
```

### Array Filters

- `join(separator)` - Join elements
- `length` - Return length
- `first` - First element
- `last` - Last element
- `map(property)` - Extract property
- `filter(property, value)` - Filter by property
- `reverse` - Reverse order
- `sort(property?)` - Sort elements
- `unique` - Remove duplicates

```typescript
"{{users | map(name) | join(', ')}}"; // Names separated by commas
"{{items | filter(status, 'active') | length}}"; // Count of active items
```

### Object Filters

- `json` - Serialize to JSON
- `keys` - Object keys
- `values` - Object values
- `get(key)` - Get a value
- `has(key)` - Check key existence
- `entries` - Key-value pairs

```typescript
"{{user | get(email)}}"; // Get email
"{{config | keys | join(', ')}}"; // List of keys
```

### Logic Filters

- `equals(value)` - Test equality
- `not` - Logical negation
- `bool` - Convert to boolean
- `gt(value)` - Greater than
- `gte(value)` - Greater than or equal
- `lt(value)` - Less than
- `lte(value)` - Less than or equal
- `contains(value)` - Contains value
- `startsWith(value)` - Starts with
- `endsWith(value)` - Ends with
- `isEmpty` - Test if empty

```typescript
"{{age | gte(18)}}"; // true if age >= 18
"{{text | contains('hello')}}"; // true if contains "hello"
```

## Template Syntax

### String Interpolation

```json
{
  "message": "Hello {{name}}!",
  "full": "{{firstName}} {{lastName}}"
}
```

### Full JSON Values

```json
{
  "user": {{userObject}},
  "count": {{itemCount}},
  "active": {{isActive}}
}
```

### Property Paths

```json
{
  "city": "{{user.address.city}}",
  "first": "{{users.0.name}}"
}
```

### Filter Chaining

```json
{
  "processed": "{{text | trim | lower | capitalize}}",
  "sorted": "{{users | map(name) | sort | join(', ')}}"
}
```

## Complete Examples

### E-commerce Template

```typescript
const template = `{
  "title": "{{product.name | capitalize}}",
  "slug": "{{product.name | slug}}",
  "price": "{{product.price}}€",
  "inStock": {{product.stock | gt(0)}},
  "categories": "{{product.categories | join(' > ')}}",
  "description": "{{product.description | truncate(100)}}"
}`;
```

### User Template

```typescript
const template = `{
  "users": {{users | filter(active, true) | map(name) | sort}},
  "totalUsers": {{users | length}},
  "activeUsers": {{users | filter(active, true) | length}},
  "adminUsers": {{users | filter(role, 'admin') | map(email)}}
}`;
```

## Testing

```bash
npm test          # All tests
npm run test:watch # Watch mode
```

## Development

```bash
npm run dev       # Demo
npm run build     # TypeScript compilation
```

## Project Structure

```
src/
├── index.ts                    # Public API
├── json-template.utils.ts      # Core engine
├── filter-registry.ts          # Filter registry
├── filters/
│   ├── string-filters.ts       # String filters
│   ├── array-filters.ts        # Array filters
│   ├── object-filters.ts       # Object filters
│   └── logic-filters.ts        # Logic filters
├── demo.ts                     # Demo
└── __tests__/                  # Unit tests
```

## Extensibility

The system is designed to be easily extensible:

1. **Custom filters** - Add your own filters with `registerFilter`
2. **Filter modules** - Create themed filter modules
3. **Simple API** - Clear interface for registration and management
4. **Type-safe** - Full TypeScript support

```typescript
// Example custom module
export function registerDateFilters() {
  registerFilter("formatDate", (date, format = "YYYY-MM-DD") => {
    // Date formatting logic
  });

  registerFilter("fromNow", (date) => {
    // "X time ago" logic
  });
}
```

## License

MIT
