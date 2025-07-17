# 🗡️ JSONBlade

**A sharp and modular JSON template engine with an extensible filter system.**

_Transform your data into JSON with precision and elegance._

[![npm version](https://img.shields.io/npm/v/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![npm downloads](https://img.shields.io/npm/dm/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![Coverage](https://img.shields.io/badge/Coverage-82%25-brightgreen.svg)](https://github.com/synesia/jsonblade)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/jsonblade)](https://bundlephobia.com/package/jsonblade)
[![Node Version](https://img.shields.io/node/v/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Why JSONBlade?

- 🎯 **80+ built-in filters** - Transform strings, arrays, objects, dates, numbers
- 🔧 **Extensible** - Add custom filters with `registerFilter()`
- ⚡ **Fast & cached** - Optimized performance with smart caching
- 🔀 **Advanced features** - Conditions, loops, variables, comments
- 🛡️ **Error resilient** - Graceful handling of missing data
- 📝 **TypeScript native** - Full type support and autocompletion
- 🎨 **Simple syntax** - Easy to learn, powerful to use

## 📦 Installation

```bash
npm install jsonblade
```

## ⚡ Quick Start

```typescript
import { compileJSONTemplate } from "jsonblade";

const template = `{
  "user": {
    "name": "{{user.name | capitalize}}",
    "email": "{{user.email | lower}}",
    "status": "{{#if user.active}}Active{{#else}}Inactive{{/if}}"
  },
  "stats": {
    "loginCount": {{user.logins | default(0)}},
    "lastSeen": "{{user.lastLogin | formatDate('DD/MM/YYYY') | default('Never')}}"
  }
}`;

const data = {
  user: {
    name: "alice smith",
    email: "ALICE@EXAMPLE.COM",
    active: true,
    logins: 42,
    lastLogin: "2024-01-15T10:30:00Z",
  },
};

const result = compileJSONTemplate(template, data);
console.log(result);
```

**Output:**

```json
{
  "user": {
    "name": "Alice smith",
    "email": "alice@example.com",
    "status": "Active"
  },
  "stats": {
    "loginCount": 42,
    "lastSeen": "15/01/2024"
  }
}
```

## 🔥 Advanced Templating

JSONBlade supports powerful templating features for complex data transformations:

### Conditions & Loops

```typescript
import { compileAdvancedTemplate } from "jsonblade";

const template = `{
  {{#set totalUsers = users | length}}
  {{#set activeUsers = users | filter(active, true) | length}}
  
  "summary": {
    "total": {{totalUsers}},
    "active": {{activeUsers}},
    "percentage": "{{activeUsers | divide(totalUsers) | multiply(100) | round(1)}}%"
  },
  
  {{#if users | length | gt(0)}}
  "userList": [
    {{#each users}}
    {
      "id": {{id}},
      "name": "{{name | capitalize}}",
      "role": "{{role | upper}}",
      "status": "{{#if active}}✅ Active{{#else}}❌ Inactive{{/if}}",
      "isLast": {{@last}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
  {{#else}}
  "userList": []
  {{/if}}
}`;

const userData = {
  users: [
    { id: 1, name: "alice", role: "admin", active: true },
    { id: 2, name: "bob", role: "user", active: false },
    { id: 3, name: "charlie", role: "moderator", active: true },
  ],
};

const result = compileAdvancedTemplate(template, userData);
```

### Variables & Comments

```typescript
const template = `{
  {{!-- Calculate user statistics --}}
  {{#set vipUsers = users | filter(points, 1000, 'gte') | length}}
  {{#set averagePoints = users | map(points) | avg | round(0)}}
  
  "analytics": {
    "vipCount": {{vipUsers}},
    "averagePoints": {{averagePoints}},
    "conversionRate": "{{vipUsers | divide(users | length) | percentage}}"
  }
}`;
```

## 🛠️ Available Filters

JSONBlade comes with 80+ built-in filters organized by category:

### String Filters

```typescript
"{{name | upper}}"; // "ALICE"
"{{name | lower}}"; // "alice"
"{{name | capitalize}}"; // "Alice"
"{{text | trim}}"; // Remove whitespace
"{{value | default('N/A')}}"; // Fallback value
"{{title | slug}}"; // "my-blog-post"
```

### Array Filters

```typescript
"{{items | join(', ')}}"; // "a, b, c"
"{{items | length}}"; // 3
"{{items | first}}"; // First element
"{{items | last}}"; // Last element
"{{users | map(name)}}"; // Extract property
"{{users | filter(active, true)}}"; // Filter by property
"{{items | reverse}}"; // Reverse array
"{{items | sort}}"; // Sort array
"{{items | unique}}"; // Remove duplicates
```

### Object Filters

```typescript
"{{obj | json}}"; // Serialize to JSON
"{{obj | keys}}"; // Get object keys
"{{obj | values}}"; // Get object values
"{{obj | get(propertyName)}}"; // Get property value
"{{obj | has(propertyName)}}"; // Check if property exists
"{{obj | entries}}"; // Get key-value pairs
```

### Date Filters

```typescript
"{{date | formatDate('DD/MM/YYYY')}}"; // "15/01/2024"
"{{date | fromNow}}"; // "2 hours ago"
"{{date | addDays(7)}}"; // Add days
"{{date | isoDate}}"; // ISO format
```

### Number Filters

```typescript
"{{price | currency('EUR')}}"; // "29,99 €"
"{{ratio | percentage}}"; // "75%"
"{{value | round(2)}}"; // Round decimals
"{{value | multiply(2)}}"; // Math operations
"{{value | add(10)}}"; // Addition
```

### Logic Filters

```typescript
"{{value | equals(42)}}"; // true/false
"{{value | gt(10)}}"; // Greater than
"{{value | bool}}"; // Convert to boolean
"{{text | contains('search')}}"; // Check if contains
"{{value | isEmpty}}"; // Check if empty
```

### Validation Filters

```typescript
"{{email | isEmail}}"; // true/false
"{{url | isUrl}}"; // Validate URL
"{{text | encode}}"; // URL encode
"{{encoded | decode}}"; // URL decode
```

## 🔧 Custom Filters

Extend JSONBlade with your own filters:

```typescript
import { registerFilter } from "jsonblade";

// Simple filter
registerFilter("exclaim", (text) => `${text}!`);

// Filter with arguments
registerFilter("repeat", (text, times = 2) => text.repeat(times));

// Complex filter
registerFilter("formatPhone", (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.replace(
    /(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
    "$1 $2 $3 $4 $5"
  );
});

// Usage
const template = `{
  "message": "{{greeting | exclaim}}",
  "echo": "{{word | repeat(3)}}",
  "phone": "{{contact | formatPhone}}"
}`;
```

## ⚡ Performance & Caching

JSONBlade automatically caches compiled templates for better performance:

```typescript
import { getCachedTemplate, clearTemplateCache } from "jsonblade";

// Templates are automatically cached
const result1 = compileJSONTemplate(template, data1);
const result2 = compileJSONTemplate(template, data2); // Uses cache

// Manual cache management
const cached = getCachedTemplate("my-template");
clearTemplateCache(); // Clear all cached templates
```

## 🔧 Configuration

Customize JSONBlade behavior:

```typescript
import { setTemplateConfig } from "jsonblade";

setTemplateConfig({
  strictMode: true, // Throw errors instead of warnings
  maxCacheSize: 1000, // Maximum cached templates
  customDelimiters: {
    // Custom template delimiters
    start: "[[",
    end: "]]",
  },
});
```

## 🎯 Common Use Cases

### API Response Formatting

```typescript
const apiTemplate = `{
  "data": [
    {{#each products}}
    {
      "id": {{id}},
      "name": "{{name | capitalize}}",
      "price": "{{price | currency('USD')}}",
      "inStock": {{stock | gt(0)}},
      "rating": {{rating | round(1)}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ],
  "meta": {
    "total": {{products | length}},
    "generated": "{{timestamp | isoDate}}"
  }
}`;
```

### Email Templates

```typescript
const emailTemplate = `{
  "to": "{{user.email}}",
  "subject": "Welcome {{user.name | capitalize}}!",
  "body": "Hello {{user.name}}, {{#if user.isPremium}}enjoy your premium features{{#else}}consider upgrading{{/if}}!",
  "variables": {
    "loginUrl": "{{baseUrl}}/login?token={{user.token | encode}}"
  }
}`;
```

### Configuration Generation

```typescript
const configTemplate = `{
  "environment": "{{env | upper}}",
  "database": {
    "host": "{{db.host | default('localhost')}}",
    "port": {{db.port | default(5432)}},
    "ssl": {{env | equals('production')}}
  },
  "features": [
    {{#each features}}
    "{{name | slug}}"{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}`;
```

## 📚 Error Handling

JSONBlade handles errors gracefully:

```typescript
const template = `{
  "safe": "{{missing.property | default('fallback')}}",
  "validated": "{{email | isEmail | bool}}",
  "calculated": "{{items | length | multiply(price) | currency('EUR')}}"
}`;

// Missing properties return null/empty values
// Unknown filters show warnings but don't break
// Invalid operations are handled gracefully
```

## 📖 More Examples

Check out more examples in our [examples repository](https://github.com/synesia/jsonblade-examples) or try JSONBlade in our [online playground](https://jsonblade.dev).

## 📜 License

MIT © [Anthony Jeamme](https://github.com/anthonyjeamme)

---

**Made with ❤️ by [Synesia.ai](https://synesia.ai)**
