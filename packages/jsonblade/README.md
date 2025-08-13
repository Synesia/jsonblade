# 🗡️ JSONBlade

**A sharp and modular JSON template engine with an extensible filter system.**

_Transform your data into JSON with precision and elegance._

[![npm version](https://img.shields.io/npm/v/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![npm downloads](https://img.shields.io/npm/dm/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![Coverage](https://img.shields.io/badge/Coverage-82%25-brightgreen.svg)](https://github.com/Synesia/jsonblade)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node Version](https://img.shields.io/node/v/jsonblade.svg)](https://www.npmjs.com/package/jsonblade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Why JSONBlade?

- 🎯 **80+ built-in filters** - Transform strings, arrays, objects, dates, numbers
- 🔧 **Extensible** - Add custom filters and functions
- 🔀 **Advanced features** - Conditions, loops, variables, comments
- 🛡️ **Error resilient** - Graceful handling of missing data
- 📝 **TypeScript native** - Full type support and autocompletion
- 🎨 **Simple syntax** - Easy to learn, powerful to use
- 🔒 **Secure by design** - No hardcoded functions, complete user control

## 📦 Installation

```bash
npm install jsonblade
```

## 🚀 Quick Start

```typescript
import { JSONBlade } from "jsonblade";

const jb = new JSONBlade({ useBuiltins: true });

const template = `{
  "greeting": "Hello {{name}}!",
  "timestamp": "{{now}}",
  "isActive": {{status | equals(active)}}
}`;

const data = {
  name: "World",
  now: new Date().toISOString(),
  status: "active",
};

const result = jb.compile(template, data);
```

## ⚡ Core Features

### String Interpolation

```typescript
const template = `{
  "message": "Welcome {{user.name}}!",
  "fullName": "{{user.firstName}} {{user.lastName}}"
}`;

const data = {
  user: {
    name: "Alice",
    firstName: "Alice",
    lastName: "Smith",
  },
};

const result = new JSONBlade({ useBuiltins: true }).compile(template, data);
```

### Nested Object Access

```typescript
const template = `{
  "city": "{{user.address.city}}",
  "country": "{{user.address.country}}"
}`;

const data = {
  user: {
    address: {
      city: "Paris",
      country: "France",
    },
  },
};
```

### Array Operations

```typescript
const template = `{
  "userCount": {{users | length}},
  "firstUser": "{{users | first | get(name)}}",
  "userNames": {{users | map(name)}}
}`;

const data = {
  users: [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 30 },
  ],
};
```

## 🔧 Built-in Filters

JSONBlade includes comprehensive filters for data transformation:

### String Filters

- `upper` - Convert to uppercase
- `lower` - Convert to lowercase
- `capitalize` - Capitalize first letter
- `trim` - Remove whitespace
- `default(value)` - Fallback value

### Array Filters

- `length` - Get array/string/object length
- `first` - Get first element
- `last` - Get last element
- `join(separator)` - Join array elements
- `map(property)` - Extract property from objects
- `filter(property, value)` - Filter by property value

### Object Filters

- `keys` - Get object keys
- `values` - Get object values
- `get(property)` - Get property value
- `has(property)` - Check if property exists
- `json` - Serialize to JSON

### Logic Filters

- `equals(value)` - Equality comparison
- `gt(value)` / `gte(value)` - Greater than
- `lt(value)` / `lte(value)` - Less than
- `not` - Boolean negation
- `bool` - Convert to boolean

### Date Filters

- `formatDate(pattern)` - Format date
- `addDays(number)` - Add days
- `isoDate` - ISO format
- `timestamp` - Unix timestamp

### Validation Filters

- `isEmail` - Email validation
- `base64Encode` / `base64Decode` - Base64 operations
- `escape` / `unescape` - HTML escape
- `urlEncode` / `urlDecode` - URL encoding

### Example Usage

```typescript
const template = `{
  "formatted": "{{name | upper | trim}}",
  "score": {{points | add(bonus) | round(2)}},
  "date": "{{created | formatDate('DD/MM/YYYY')}}",
  "valid": {{email | isEmail}}
}`;
```

## 🔧 Template Functions

JSONBlade now supports custom functions that can be called directly in templates using function syntax `{{functionName(args)}}`. **No functions are included by default** - you have complete control over what functions are available.

### Synchronous Functions

```typescript
import { JSONBlade, TemplateFunction } from "jsonblade";

// Define your custom functions
const functions: TemplateFunction[] = [
  {
    name: "getSecret",
    func: (key: string) => process.env[key] || null,
  },
  {
    name: "add",
    func: (a: number, b: number) => a + b,
  },
  {
    name: "formatPhone",
    func: (phone: string) => {
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },
  },
];

// Use functions in template
const template = `{
  "apiKey": "{{getSecret('API_KEY')}}",
  "sum": {{add(5, 3)}},
  "phone": "{{formatPhone('1234567890')}}",
  "greeting": "Hello {{name}}!"
}`;

const data = { name: "World" };
const result = new JSONBlade({ useBuiltins: true }).compile(
  template,
  data,
  functions
);
// Result: { apiKey: "your_api_key", sum: 8, phone: "(123) 456-7890", greeting: "Hello World!" }
```

### Asynchronous Functions

```typescript
import { JSONBlade, TemplateFunction } from "jsonblade";

// Define async functions
const asyncFunctions: TemplateFunction[] = [
  {
    name: "fetchData",
    func: async (url: string) => {
      const response = await fetch(url);
      return response.json();
    },
  },
  {
    name: "getCurrentTime",
    func: async () => new Date().toISOString(),
  },
  {
    name: "validateEmail",
    func: async (email: string) => {
      // Simulate async validation
      await new Promise((resolve) => setTimeout(resolve, 100));
      return email.includes("@") && email.includes(".");
    },
  },
];

// Use async functions
const asyncTemplate = `{
  "data": {{fetchData('https://api.example.com/data')}},
  "timestamp": "{{getCurrentTime()}}",
  "emailValid": {{validateEmail(user.email)}}
}`;

const data = { user: { email: "test@example.com" } };
const result = await new JSONBlade({ useBuiltins: true }).compileAsync(
  asyncTemplate,
  data,
  asyncFunctions
);
```

### Function vs Filter Syntax

```typescript
// Function syntax: {{functionName(args)}}
"{{getSecret('API_KEY')}}"; // Call function directly
"{{add(5, 3)}}"; // Function with multiple arguments

// Filter syntax: {{value | filterName}}
"{{name | upper}}"; // Transform value through filter
"{{items | length}}"; // Get length of array
```

**When to use functions vs filters:**

- **Functions**: When you need to call operations directly or compute values from scratch
- **Filters**: When you want to transform existing values in a pipeline

### Key Features:

- ✅ **Complete control**: No default functions, define only what you need
- ✅ **Type safety**: Full TypeScript support with `TemplateFunction` interface
- ✅ **Sync and async**: Both synchronous and asynchronous functions supported
- ✅ **Argument parsing**: Supports strings (`'value'`), numbers (`42`), and data paths (`user.name`)
- ✅ **Fallback behavior**: Unknown functions fallback to data path resolution
- ✅ **Secure**: No hardcoded functions that could be security risks

## 🔄 Async Operations

```typescript
import { JSONBlade, TemplateFunction } from "jsonblade";

const asyncFunctions: TemplateFunction[] = [
  {
    name: "fetchUser",
    func: async (id: string) => {
      const response = await fetch(`/api/users/${id}`);
      return response.json();
    },
  },
];

const jb = new JSONBlade({ useBuiltins: true });
const template = `{"user": {{fetchUser(userId)}}}`;
const result = await jb.compileAsync(
  template,
  { userId: "123" },
  asyncFunctions
);
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

JSONBlade comes with a comprehensive set of built-in filters organized by category:

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

### Synchronous Filters

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

### Asynchronous Filters

Create powerful async filters for external integrations:

```typescript
import { registerAsyncFilter } from "jsonblade";

// Database lookup
registerAsyncFilter("findUser", async (userId) => {
  const user = await db.users.findById(userId);
  return user || { name: "Unknown", active: false };
});

// API integration
registerAsyncFilter("translateText", async (text, targetLang = "en") => {
  const response = await fetch(`https://api.translate.com/v1/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target: targetLang }),
  });
  const result = await response.json();
  return result.translatedText;
});

// External validation
registerAsyncFilter("validateEmail", async (email) => {
  const response = await fetch(
    `https://api.emailvalidation.com/check?email=${email}`
  );
  const result = await response.json();
  return result.valid;
});

// Usage with async compilation
const template = `{
  "user": "{{userId | findUser}}",
  "message": "{{text | translateText('fr')}}",
  "emailValid": {{email | validateEmail}}
}`;

// Note: engine does not execute async filters in pipeline yet
```

<!-- No automatic caching in the current engine version -->

## 🔧 Configuration

Customize JSONBlade behavior:

```typescript
import { setTemplateConfig } from "jsonblade";

setTemplateConfig({
  strictMode: true, // Throw errors instead of warnings
  // no cache settings in current version
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

### Dynamic Configuration with Custom Functions

```typescript
// Define functions for configuration
const configFunctions: TemplateFunction[] = [
  {
    name: "getSecret",
    func: (key: string) => process.env[key] || null,
  },
  {
    name: "getCurrentTime",
    func: () => new Date().toISOString(),
  },
];

const configTemplate = `{
  "environment": "{{env | upper}}",
  "database": {
    "host": "{{db.host | default('localhost')}}",
    "port": {{db.port | default(5432)}},
    "ssl": {{env | equals('production')}},
    "password": "{{getSecret('DB_PASSWORD')}}"
  },
  "services": {
    "redis": {
      "url": "{{getSecret('REDIS_URL') | default('redis://localhost:6379')}}"
    },
    "apiKeys": {
      "stripe": "{{getSecret('STRIPE_SECRET_KEY')}}",
      "sendgrid": "{{getSecret('SENDGRID_API_KEY')}}"
    }
  },
  "metadata": {
    "generatedAt": "{{getCurrentTime()}}"
  }
}`;

const config = new JSONBlade({ useBuiltins: true }).compile(
  configTemplate,
  { env: "production", db: { host: "prod-db.example.com", port: 5432 } },
  configFunctions
);
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

### Custom Function Examples

```typescript
// Define application-specific functions
const appFunctions: TemplateFunction[] = [
  {
    name: "calculateTax",
    func: (amount: number, rate: number = 0.1) => amount * rate,
  },
  {
    name: "formatCurrency",
    func: (amount: number, currency: string = "USD") => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    },
  },
  {
    name: "generateId",
    func: () => Math.random().toString(36).substring(2, 15),
  },
];

const invoiceTemplate = `{
  "id": "{{generateId()}}",
  "subtotal": "{{formatCurrency(amount)}}",
  "tax": "{{formatCurrency(calculateTax(amount, 0.08))}}",
  "total": "{{formatCurrency(add(amount, calculateTax(amount, 0.08)))}}"
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

## 📖 Need Help?

For questions, issues, or feature requests, please visit our [GitHub repository](https://github.com/Synesia/jsonblade) or [open an issue](https://github.com/Synesia/jsonblade/issues).

## 📜 License

MIT © [Anthony Jeamme](https://github.com/anthonyjeamme)

---

**Made with ❤️ by [Synesia.ai](https://synesia.ai)**
