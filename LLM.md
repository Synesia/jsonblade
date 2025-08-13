# JSONBlade - LLM Reference Guide

## Overview

JSONBlade is a powerful JSON template engine for Node.js/TypeScript that enables dynamic JSON generation with filters, conditionals, loops, variables, and advanced templating features. It supports both synchronous and asynchronous operations.

## Core Concepts

### Template Syntax

- **Variable interpolation**: `{{variableName}}`
- **Filters**: `{{value | filterName}}`
- **Filter chaining**: `{{value | filter1 | filter2}}`
- **Filter arguments**: `{{value | filterName(arg1, arg2)}}`
- **Async filters**: Same syntax, requires async compilation

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

### Async Usage

```typescript
import {
  compileJSONTemplateAsync,
  compileAdvancedTemplateAsync,
  registerAsyncFilter,
} from "jsonblade";

// Register async filters
registerAsyncFilter("getSecret", async (name) => process.env[name]);
registerAsyncFilter("httpGet", async (url) => {
  const response = await fetch(url);
  return await response.text();
});

// Async basic templating
const asyncTemplate =
  '{"secret": "{{API_KEY | getSecret}}", "data": "{{url | httpGet | jsonParse}}"}';
const asyncResult = await compileJSONTemplateAsync(asyncTemplate, {
  url: "https://api.example.com/data",
});

// Async advanced templating
const asyncAdvancedResult = await compileAdvancedTemplateAsync(
  asyncTemplate,
  data
);
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

## Async Filters

JSONBlade includes powerful built-in async filters and supports custom async filter registration.

### Environment & Secrets

- **getSecret**: Get environment variable `{{API_KEY | getSecret}}` or `{{'' | getSecret('DATABASE_URL')}}`

### HTTP Operations

- **httpGet**: GET request `{{url | httpGet}}`
- **httpPost**: POST request `{{data | httpPost(url)}}` or `{{data | httpPost(url, contentType)}}`
- **jsonParse**: Parse JSON string `{{jsonString | jsonParse}}`

### File Operations

- **loadFile**: Read file content `{{filename | loadFile}}` or `{{'' | loadFile(path)}}`
- **saveFile**: Write file content `{{content | saveFile(path)}}`

### Timing & Delays

- **delay**: Add delay in milliseconds `{{value | delay(1000)}}`
- **sleep**: Sleep for seconds `{{2 | sleep}}` or `{{'' | sleep(duration)}}`
- **getCurrentTime**: Get current ISO timestamp `{{'' | getCurrentTime}}`
- **getCurrentTimestamp**: Get current Unix timestamp `{{'' | getCurrentTimestamp}}`

### System Operations

- **exec**: Execute shell command `{{command | exec}}` or `{{'' | exec(command)}}`

### Caching & Performance

- **cache**: Cache value with TTL `{{expensiveData | cache(key, 300)}}` (300 seconds)
- **retry**: Retry operation with delays `{{data | retry(3, 1000)}}` (3 retries, 1s delay)

### Array Processing (Async)

- **asyncFilter**: Filter array asynchronously `{{items | asyncFilter('truthy')}}` or `{{items | asyncFilter('falsy')}}`

### Custom Async Filters

```typescript
import { registerAsyncFilter } from "jsonblade";

// Database lookup
registerAsyncFilter("findUser", async (userId) => {
  const user = await db.users.findById(userId);
  return user || { name: "Unknown" };
});

// API integration
registerAsyncFilter("translateText", async (text, targetLang = "en") => {
  const response = await fetch("https://api.translate.com/v1/translate", {
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
```

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

## Async Advanced Templates

### Async Conditionals

Use async filters in conditional statements:

```json
{
  {{#set userData = userId | findUser}}
  {{#set isValidEmail = userData.email | validateEmail}}

  "user": {
    "id": "{{userId}}",
    "name": "{{userData.name}}",
    "email": "{{userData.email}}",
    "emailValid": {{isValidEmail}},
    "status": "{{#if isValidEmail}}verified{{#else}}unverified{{/if}}"
  }
}
```

### Async Loops with External Data

Process arrays with async operations:

```json
{
  "services": [
    {{#each serviceUrls}}
    {{#set healthData = . | httpGet | jsonParse}}
    {
      "url": "{{.}}",
      "status": "{{healthData.status | default('unknown')}}",
      "responseTime": "{{healthData.responseTime | default(0)}}ms",
      "healthy": {{healthData.status | equals('ok')}},
      "lastCheck": "{{'' | getCurrentTime}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

### Async Variables with HTTP APIs

Fetch and process external data:

```json
{
  {{#set weatherData = city | httpGet('https://api.weather.com/v1/current?q=') | jsonParse}}
  {{#set newsData = 'latest' | httpGet('https://api.news.com/v1/headlines') | jsonParse}}
  {{#set exchangeRates = baseCurrency | httpGet('https://api.exchange.com/v1/rates?base=') | jsonParse}}

  "dashboard": {
    "location": "{{city}}",
    "weather": {
      "temperature": "{{weatherData.temperature}}°C",
      "condition": "{{weatherData.condition | capitalize}}",
      "humidity": "{{weatherData.humidity}}%"
    },
    "news": [
      {{#each newsData.articles | first(3)}}
      {
        "title": "{{title}}",
        "summary": "{{description | truncate(100)}}",
        "publishedAt": "{{publishedAt | formatDate('DD/MM/YYYY')}}"
      }{{#unless @last}},{{/unless}}
      {{/each}}
    ],
    "exchange": {
      "base": "{{baseCurrency | upper}}",
      "rates": {
        "USD": {{exchangeRates.USD | default(1)}},
        "EUR": {{exchangeRates.EUR | default(1)}}
      }
    },
    "generated": "{{'' | getCurrentTime}}"
  }
}
```

### Async Error Handling and Fallbacks

Handle failures gracefully:

```json
{
  {{#set primaryData = primaryUrl | httpGet | jsonParse}}
  {{#set backupData = backupUrl | httpGet | jsonParse}}

  "data": {{#if primaryData}}{{primaryData}}{{#else}}{{backupData}}{{/if}},
  "source": "{{#if primaryData}}primary{{#else}}backup{{/if}}",
  "reliable": {{#if primaryData}}true{{#else}}false{{/if}}
}
```

### Async Caching Strategies

Optimize performance with caching:

```json
{
  {{#set expensiveData = dataKey | cache('expensive-operation', 300) | httpGet('https://expensive-api.com/data') | jsonParse}}
  {{#set userProfile = userId | cache('user-' + userId, 600) | findUser}}

  "result": {
    "data": {{expensiveData}},
    "user": {{userProfile}},
    "cached": true,
    "ttl": "{{#if expensiveData}}300{{#else}}0{{/if}} seconds"
  }
}
```

### Best Practices

1. Use `default` filter for fallback values
2. Chain filters for complex transformations
3. Use variables for repeated calculations
4. Test with empty/null data
5. Validate input data before templating
6. **For Async**: Handle errors gracefully with fallbacks
7. **For Async**: Use caching for expensive operations
8. **For Async**: Avoid too many concurrent HTTP requests
9. **For Async**: Set reasonable timeouts for external calls

## Performance Tips

1. Use template caching for repeated templates
2. Minimize deep object access
3. Use specific filters instead of complex logic
4. Pre-process data when possible
5. Avoid deeply nested loops

## Common Use Cases

### Synchronous Use Cases

- API response formatting
- Email template generation
- Configuration file generation
- Report generation
- Data transformation
- Dashboard data preparation
- Export formats (CSV, XML via JSON)

### Asynchronous Use Cases

- Microservice health monitoring
- Real-time dashboard generation with live data
- Dynamic configuration with secrets management
- Multi-API data aggregation
- External service integration
- Database-driven template compilation
- Automated report generation with external data
- Live pricing and inventory updates
- User personalization with external profile data
- Content translation and localization
- Real-time analytics and metrics collection
