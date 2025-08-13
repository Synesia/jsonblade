# JSONBlade Syntax Specification

## Complete Guide for Monaco Editor Plugin Development

### Overview

JSONBlade is a JSON templating engine that allows embedding dynamic expressions in JSON. It supports variable interpolation, filters, conditions, loops, and asynchronous data manipulation.

---

## 1. Basic Structure

### General Format

```
{{ expression }}
```

### Expression Types

- **Simple variables**: `{{user.name}}`
- **Variables with filters**: `{{user.name | upper}}`
- **Directives**: `{{#if condition}}...{{/if}}`
- **Comments**: `{{! comment }}`

---

## 2. Variable Interpolation

### Basic Syntax

```json
{
  "name": "{{user.name}}",
  "age": {{user.age}},
  "active": {{user.isActive}}
}
```

### Property Access

```
{{user.name}}          // Simple property
{{user.address.city}}  // Nested property
{{items.0.title}}      // Array index
{{items.length}}       // Length property
{{.}}                  // Current item (in loops)
```

### Special Keywords in Loops

```
{{@index}}    // Current index (0, 1, 2...)
{{@first}}    // true for the first element
{{@last}}     // true for the last element
{{this}}      // Current item (alias of .)
```

---

## 3. Filters

### General Syntax

```
{{value | filter}}
{{value | filter(arg1, arg2)}}
{{value | filter1 | filter2 | filter3}}
```

### String Filters

| Filter       | Syntax                            | Description            | Example         |
| ------------ | --------------------------------- | ---------------------- | --------------- |
| `upper`      | `{{text \| upper}}`               | Converts to uppercase  | `"HELLO"`       |
| `lower`      | `{{text \| lower}}`               | Converts to lowercase  | `"hello"`       |
| `capitalize` | `{{text \| capitalize}}`          | First letter uppercase | `"Hello"`       |
| `trim`       | `{{text \| trim}}`                | Removes whitespace     | `"hello"`       |
| `default`    | `{{text \| default('fallback')}}` | Default value          | `"fallback"`    |
| `slug`       | `{{title \| slug}}`               | Converts to URL slug   | `"hello-world"` |

### Array Filters

| Filter    | Syntax                                | Description        | Example            |
| --------- | ------------------------------------- | ------------------ | ------------------ |
| `join`    | `{{array \| join(',')}}`              | Joins elements     | `"a,b,c"`          |
| `length`  | `{{array \| length}}`                 | Array length       | `3`                |
| `first`   | `{{array \| first}}`                  | First element      | `"a"`              |
| `last`    | `{{array \| last}}`                   | Last element       | `"c"`              |
| `map`     | `{{users \| map('name')}}`            | Extract property   | `["Alice", "Bob"]` |
| `filter`  | `{{users \| filter('active', true)}}` | Filter by property | `[...]`            |
| `reverse` | `{{array \| reverse}}`                | Reverse order      | `[3,2,1]`          |
| `sort`    | `{{array \| sort}}`                   | Sort array         | `[1,2,3]`          |
| `unique`  | `{{array \| unique}}`                 | Remove duplicates  | `[1,2,3]`          |

### Logic Filters

| Filter       | Syntax                          | Description        | Example |
| ------------ | ------------------------------- | ------------------ | ------- |
| `equals`     | `{{value \| equals(42)}}`       | Equality test      | `true`  |
| `not`        | `{{value \| not}}`              | Boolean negation   | `false` |
| `bool`       | `{{value \| bool}}`             | Convert to boolean | `true`  |
| `gt`         | `{{number \| gt(10)}}`          | Greater than       | `true`  |
| `gte`        | `{{number \| gte(10)}}`         | Greater or equal   | `true`  |
| `lt`         | `{{number \| lt(10)}}`          | Less than          | `false` |
| `lte`        | `{{number \| lte(10)}}`         | Less or equal      | `false` |
| `contains`   | `{{text \| contains('hello')}}` | Contains value     | `true`  |
| `startsWith` | `{{text \| startsWith('Hi')}}`  | Starts with        | `true`  |
| `endsWith`   | `{{text \| endsWith('!')}}`     | Ends with          | `true`  |
| `isEmpty`    | `{{value \| isEmpty}}`          | Test if empty      | `true`  |

### Number Filters

| Filter       | Syntax                         | Description         | Example     |
| ------------ | ------------------------------ | ------------------- | ----------- |
| `round`      | `{{number \| round(2)}}`       | Round to N decimals | `3.14`      |
| `ceil`       | `{{number \| ceil}}`           | Round up            | `4`         |
| `floor`      | `{{number \| floor}}`          | Round down          | `3`         |
| `abs`        | `{{number \| abs}}`            | Absolute value      | `5`         |
| `currency`   | `{{price \| currency('EUR')}}` | Currency format     | `"29,99 €"` |
| `percentage` | `{{ratio \| percentage}}`      | Percentage format   | `"85%" `    |
| `multiply`   | `{{number \| multiply(2)}}`    | Multiplication      | `20`        |
| `divide`     | `{{number \| divide(2)}}`      | Division            | `5`         |
| `add`        | `{{number \| add(10)}}`        | Addition            | `15`        |
| `subtract`   | `{{number \| subtract(5)}}`    | Subtraction         | `10`        |

### Date Filters

| Filter       | Syntax                                 | Description    | Example         |
| ------------ | -------------------------------------- | -------------- | --------------- |
| `formatDate` | `{{date \| formatDate('YYYY-MM-DD')}}` | Format date    | `"2024-01-15"`  |
| `fromNow`    | `{{date \| fromNow}}`                  | Relative time  | `"2 hours ago"` |
| `dayOfWeek`  | `{{date \| dayOfWeek}}`                | Day of week    | `"Monday"`      |
| `timestamp`  | `{{date \| timestamp}}`                | Unix timestamp | `1642204800`    |

### Validation Filters

| Filter          | Syntax                            | Description     | Example           |
| --------------- | --------------------------------- | --------------- | ----------------- |
| `isEmail`       | `{{email \| isEmail}}`            | Validate email  | `true`            |
| `isURL`         | `{{url \| isURL}}`                | Validate URL    | `true`            |
| `isUUID`        | `{{id \| isUUID}}`                | Validate UUID   | `true`            |
| `isNumber`      | `{{value \| isNumber}}`           | Test if number  | `true`            |
| `isInteger`     | `{{value \| isInteger}}`          | Test if integer | `true`            |
| `isPhoneNumber` | `{{phone \| isPhoneNumber}}`      | Validate phone  | `true`            |
| `minLength`     | `{{text \| minLength(5)}}`        | Minimum length  | `true`            |
| `maxLength`     | `{{text \| maxLength(100)}}`      | Maximum length  | `true`            |
| `matches`       | `{{text \| matches('^[A-Z]+$')}}` | Regex match     | `true`            |
| `base64Encode`  | `{{text \| base64Encode}}`        | Base64 encode   | `"aGVsbG8="`      |
| `base64Decode`  | `{{text \| base64Decode}}`        | Base64 decode   | `"hello"`         |
| `escape`        | `{{html \| escape}}`              | HTML escape     | `"&lt;div&gt;"`   |
| `unescape`      | `{{html \| unescape}}`            | HTML unescape   | `"<div>"`         |
| `urlEncode`     | `{{text \| urlEncode}}`           | URL encode      | `"hello%20world"` |

### Object Filters

| Filter    | Syntax                     | Description             | Example      |
| --------- | -------------------------- | ----------------------- | ------------ |
| `json`    | `{{object \| json}}`       | Serialize to JSON       | `'{"a":1}'`  |
| `keys`    | `{{object \| keys}}`       | Object keys             | `["a", "b"]` |
| `values`  | `{{object \| values}}`     | Object values           | `[1, 2]`     |
| `get`     | `{{object \| get('key')}}` | Get property            | `"value"`    |
| `has`     | `{{object \| has('key')}}` | Test if property exists | `true`       |
| `entries` | `{{object \| entries}}`    | Key-value pairs         | `[["a",1]]`  |

### Async Filters

JSONBlade does not include default async filters. Users must register their own async filters using `registerAsyncFilter()`:

```typescript
import { registerAsyncFilter } from "jsonblade";

registerAsyncFilter("httpGet", async (url) => {
  const response = await fetch(url);
  return response.text();
});

registerAsyncFilter("getSecret", async (key) => {
  return process.env[key] || null;
});
```

### Custom Functions

JSONBlade supports custom functions that can be called directly in templates:

```typescript
import { compileJSONTemplate, TemplateFunction } from "jsonblade";

const functions: TemplateFunction[] = [
  {
    name: "getSecret",
    func: (key: string) => process.env[key] || null,
  },
  {
    name: "httpGet",
    func: async (url: string) => {
      const response = await fetch(url);
      return response.text();
    },
  },
];

// Usage: {{getSecret('API_KEY')}} or {{httpGet('https://api.example.com')}}
const result = compileJSONTemplate(template, data, functions);
```

---

## 4. Conditions

### Simple If

```json
{
  "message": "{{#if user.isActive}}Welcome!{{/if}}"
}
```

### If-Else

```json
{
  "status": "{{#if user.isActive}}Active{{#else}}Inactive{{/if}}"
}
```

### Nested If-Else

```json
{
  "level": "{{#if score | gte(90)}}Excellent{{#else}}{{#if score | gte(70)}}Good{{#else}}Needs improvement{{/if}}{{/if}}"
}
```

### Unless (negation)

```json
{
  "error": "{{#unless user.isValid}}Invalid user{{/unless}}"
}
```

### Conditions with Filters

```json
{
  "access": "{{#if role | equals('admin')}}Full access{{#else}}Limited{{/if}}"
}
```

---

## 5. Loops

### Simple Loop

```json
{
  "users": [
    {{#each users}}
    {
      "name": "{{name}}",
      "index": {{@index}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

### Loop with Conditions

```json
{
  "activeUsers": [
    {{#each users}}
    {{#if active}}
    {
      "name": "{{name}}",
      "role": "{{role}}"
    }{{#unless @last}},{{/unless}}
    {{/if}}
    {{/each}}
  ]
}
```

### Nested Loops

```json
{
  "categories": [
    {{#each categories}}
    {
      "name": "{{name}}",
      "items": [
        {{#each items}}
        "{{this}}"{{#unless @last}},{{/unless}}
        {{/each}}
      ]
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

---

## 6. Variables

### Variable Definition

```json
{
  {{#set userName = user.name | upper}}
  {{#set userCount = users | length}}
  "greeting": "Hello {{userName}}!",
  "total": "{{userCount}} users found"
}
```

### Variables with Filters

```json
{
  {{#set processedData = data | filter('active', true) | map('name') | join(', ')}}
  "result": "{{processedData}}"
}
```

### Variables in Loops (async)

```json
{
  "processed": [
    {{#each items}}
    {{#set processedItem = . | asyncProcessItem}}
    {
      "id": {{processedItem.id}},
      "status": "{{processedItem.status}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

---

## 7. Comments

### Simple Comments

```json
{
  {{! This is a comment }}
  "data": "{{value}}"
}
```

### Multi-line Comments

```json
{
  {{!
    Multi-line comment
    to explain logic
  }}
  "result": "{{calculation}}"
}
```

---

## 8. Expressions and Literals

### Literal Types

```
"string"        // String literal
'string'        // String with single quotes
42              // Integer number
3.14            // Decimal number
true/false      // Booleans
null            // Null value
```

### Complex Expressions

```json
{
  "computed": {{users | filter('active', true) | length | multiply(2)}}
}
```

---

## 9. Regex Patterns for Monaco

### Main Tokens

```javascript
// Main delimiters
DELIM_OPEN: /\{\{/;
DELIM_CLOSE: /\}\}/;

// Directives
IF: /#if\s+/;
ELSE: /#else/;
ENDIF: /\/if/;
UNLESS: /#unless\s+/;
ENDUNLESS: /\/unless/;
EACH: /#each\s+/;
ENDEACH: /\/each/;
SET: /#set\s+/;
COMMENT: /!/;

// Special loop keywords
LOOP_INDEX: /@index/;
LOOP_FIRST: /@first/;
LOOP_LAST: /@last/;
CURRENT_ITEM: /\./;

// Operators and symbols
PIPE: /\|/;
EQUALS: /=/;
COMMA: /,/;
DOT: /\./;
PAREN_OPEN: /\(/;
PAREN_CLOSE: /\)/;

// Identifiers and values
IDENTIFIER: /[a-zA-Z_][a-zA-Z0-9_]*/;
NUMBER: /\d+(\.\d+)?/;
STRING_DOUBLE: /"([^"\\]|\\.)*"/;
STRING_SINGLE: /'([^'\\]|\\.)*'/;
BOOLEAN: /true|false/;
NULL: /null/;
```

### Grammar Structure

```
template := (text | expression)*

expression := "{{" (comment | directive | interpolation) "}}"

comment := "!" text

directive := if_directive | unless_directive | each_directive | set_directive

if_directive := "#if" condition template ("#else" template)? "/if"

unless_directive := "#unless" condition template "/unless"

each_directive := "#each" path template "/each"

set_directive := "#set" identifier "=" expression

interpolation := path ("|" filter)*

path := identifier ("." identifier | "[" index "]")*

filter := identifier ("(" argument_list ")")?

argument_list := argument ("," argument)*

argument := path | literal

literal := string | number | boolean | null

condition := path ("|" filter)*
```

---

## 10. Auto-completion and IntelliSense

### Contextual Suggestions

#### In expressions `{{|}}`

- Available variables in context
- Applicable filters by type
- Special keywords (`@index`, `@first`, `@last`, `.`)

#### After a pipe `{{value | |}`

- List of compatible filters
- Filters grouped by category
- Signatures with parameters

#### In directives `{{#|}}`

- `if`, `unless`, `each`, `set`
- Complete structure completion

#### Filter parameters `{{value | filter(|)}}`

- Types expected by filter
- Common value suggestions
- Context variables

### Syntax Validation

#### Common errors to detect

- Unclosed directives (`{{#if}}` without `{{/if}}`)
- Non-existent filters
- Invalid filter parameters
- Undefined variables
- Invalid expression syntax

---

## 11. Syntax Highlighting

### Suggested Colors

```css
.jsonblade-delimiter {
  color: #569cd6;
} /* {{ }} */
.jsonblade-directive {
  color: #c586c0;
} /* #if, #each, etc. */
.jsonblade-variable {
  color: #9cdcfe;
} /* user.name */
.jsonblade-filter {
  color: #dcdcaa;
} /* upper, lower */
.jsonblade-operator {
  color: #d4d4d4;
} /* | = */
.jsonblade-string {
  color: #ce9178;
} /* "text" */
.jsonblade-number {
  color: #b5cea8;
} /* 42 */
.jsonblade-boolean {
  color: #569cd6;
} /* true, false */
.jsonblade-comment {
  color: #6a9955;
} /* {{! comment }} */
.jsonblade-loop-keyword {
  color: #4fc1ff;
} /* @index, @first */
.jsonblade-current-item {
  color: #ff6b6b;
} /* . */
```

### Parser States

- `NORMAL` : Normal JSON
- `EXPRESSION` : Inside `{{...}}`
- `DIRECTIVE` : Inside `{{#...}}`
- `COMMENT` : Inside `{{!...}}`
- `FILTER_ARGS` : Inside `filter(...)`

---

## 12. Useful Snippets

```javascript
const snippets = {
  if: {
    prefix: "if",
    body: ["{{#if ${1:condition}}}", "\t$0", "{{/if}}"],
    description: "If condition",
  },
  ifelse: {
    prefix: "ifelse",
    body: [
      "{{#if ${1:condition}}}",
      "\t${2:true_content}",
      "{{#else}}",
      "\t${3:false_content}",
      "{{/if}}",
    ],
    description: "If-else condition",
  },
  each: {
    prefix: "each",
    body: ["{{#each ${1:array}}}", "\t$0", "{{/each}}"],
    description: "Each loop",
  },
  set: {
    prefix: "set",
    body: ["{{#set ${1:varName} = ${2:expression}}}"],
    description: "Variable definition",
  },
};
```

---

This document provides a complete foundation for developing a Monaco Editor plugin for JSONBlade with syntax highlighting, auto-completion, validation and snippets support!
