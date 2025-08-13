# JSONBlade LLM Integration Guide

JSONBlade is a powerful JSON templating engine designed for LLM applications, AI agents, and dynamic data processing. This guide shows you how to integrate JSONBlade effectively with **complete control over functionality** through custom functions.

## Quick Start for LLMs

```typescript
import { JSONBlade, TemplateFunction } from "jsonblade";

// Define custom functions for your specific use case
const functions: TemplateFunction[] = [
  {
    name: "getCurrentTime",
    func: () => new Date().toISOString(),
  },
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
  {
    name: "generateId",
    func: () => Math.random().toString(36).substring(2, 15),
  },
];

const jb = new JSONBlade({ useBuiltins: true });

// Sync template
const syncTemplate = `{
  "id": "{{generateId()}}",
  "timestamp": "{{getCurrentTime()}}",
  "config": "{{getSecret('API_KEY')}}"
}`;

const syncResult = jb.compile(syncTemplate, {}, functions);

// Async template
const asyncTemplate = `{
  "data": "{{httpGet('https://api.example.com/data')}}",
  "processed_at": "{{getCurrentTime()}}"
}`;

const asyncResult = await jb.compileAsync(asyncTemplate, {}, functions);
```

## Core Concepts

### 1. Design: Functions custom et API d’instance

JSONBlade n’embarque pas de fonctions custom par défaut. Vous fournissez vos propres fonctions via `TemplateFunction[]`, et utilisez une instance `new JSONBlade()` pour compiler vos templates. Cela garantit:

- **Security**: aucun appel inattendu
- **Transparency**: vous savez exactement ce qui est disponible
- **Flexibility**: vous définissez uniquement ce dont vous avez besoin
- **Control**: personnalisation complète pour votre cas d’usage

### 2. Template Syntax

- **String interpolation**: `"{{variable}}"`
- **Direct values**: `{{variable}}`
- **Filters**: `{{value | filterName}}`
- **Function calls**: `{{functionName(args)}}`

### 3. Data Access

```typescript
const data = {
  user: {
    name: "Alice",
    profile: {
      email: "alice@example.com",
    },
  },
};

const template = `{
  "name": "{{user.name}}",
  "email": "{{user.profile.email}}"
}`;
```

### 4. Built-in Filters

JSONBlade includes a set of built-in filters for common operations:

#### String Operations

- **upper/lower/capitalize**: Text transformation
- **trim**: Remove whitespace
- **default**: Fallback values

#### Array Operations

- **length**: Get count
- **first/last**: Get elements
- **map**: Extract properties
- **filter**: Filter by criteria

#### Logic Operations

- **equals/gt/lt**: Comparisons
- **bool/not**: Boolean logic

#### Date Operations

- **formatDate**: Custom date formats
- **addDays**: Date arithmetic

#### Validation

- **isEmail**: Email validation
- **base64Encode/Decode**: Encoding operations

### 5. Custom Functions System

Define exactly the functions you need for your LLM application:

```typescript
const llmFunctions: TemplateFunction[] = [
  {
    name: "llmProcess",
    func: async (text: string, model: string) => {
      // Your LLM processing logic
      return await processWithLLM(text, model);
    },
  },
  {
    name: "vectorSearch",
    func: async (query: string, limit: number = 10) => {
      // Vector database search
      return await searchVectors(query, limit);
    },
  },
  {
    name: "sanitizeInput",
    func: (input: string) => {
      // Input sanitization
      return input.replace(/[<>]/g, "");
    },
  },
];

const template = `{
  "query": "{{sanitizeInput(userQuery)}}",
  "response": "{{llmProcess(userQuery, 'gpt-4')}}",
  "related": {{vectorSearch(userQuery, 5)}}
}`;
```

## Advanced Features

### Conditional Logic

```typescript
const template = `{
  "message": "{{#if user.isPremium}}Premium content{{#else}}Basic content{{/if}}",
  "features": [
    {{#each availableFeatures}}
    "{{name}}"{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}`;
```

### Variables and Calculations

```typescript
const template = `{
  {{#set totalScore = math.round(score1 + score2)}}
  "individual": [{{score1}}, {{score2}}],
  "total": {{totalScore}},
  "grade": "{{#if totalScore | gt(80)}}A{{#else}}B{{/if}}"
}`;
```

### Loops and Iteration

```typescript
const template = `{
  "users": [
    {{#each users}}
    {
      "id": {{@index}},
      "name": "{{name | capitalize}}",
      "isLast": {{@last}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}`;
```

## Best Practices for LLMs

### 1. Structured Output

Use JSONBlade to ensure consistent, valid JSON output from LLMs:

```typescript
const outputFunctions: TemplateFunction[] = [
  {
    name: "getCurrentTime",
    func: () => new Date().toISOString(),
  },
  {
    name: "validateConfidence",
    func: (score: number) => Math.max(0, Math.min(1, score)),
  },
];

const llmResponseTemplate = `{
  "analysis": "{{analysis | trim}}",
  "confidence": {{validateConfidence(rawConfidence)}},
  "categories": {{categories | json}},
  "timestamp": "{{getCurrentTime()}}"
}`;
```

### 2. Data Validation

Apply validation filters to ensure data quality:

```typescript
const validationFunctions: TemplateFunction[] = [
  {
    name: "validateEmail",
    func: (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  },
];

const template = `{
  "email": "{{userEmail | lower | trim}}",
  "isValidEmail": {{validateEmail(userEmail)}},
  "score": {{rawScore | round(2) | max(0) | min(100)}}
}`;
```

### 3. Error Handling

Use default values and graceful fallbacks:

```typescript
const template = `{
  "result": "{{aiResponse | default('No response available')}}",
  "status": "{{processingStatus | default('unknown')}}",
  "fallback": "{{complexCalculation | default(0)}}"
}`;
```

### 4. Performance

- Préférez `compile` lorsqu’aucune fonction n’est async
- Regroupez vos appels async dans des fonctions custom
- Évitez les templates trop volumineux non nécessaires

## Integration Examples

### RAG (Retrieval Augmented Generation)

```typescript
const ragFunctions: TemplateFunction[] = [
  {
    name: "searchDocs",
    func: async (query: string) => {
      // Implement your vector search
      return await vectorDatabase.search(query, { limit: 5 });
    },
  },
  {
    name: "generateResponse",
    func: async (context: string, question: string) => {
      // Implement your LLM call
      return await llm.generate({
        prompt: `Context: ${context}\nQuestion: ${question}`,
        model: "gpt-4",
      });
    },
  },
  {
    name: "extractSources",
    func: (documents: any[]) => {
      return documents.map((doc) => ({
        title: doc.title,
        url: doc.url,
        relevance: doc.score,
      }));
    },
  },
];

const ragTemplate = `{
  "query": "{{userQuestion}}",
  {{#set searchResults = searchDocs(userQuestion)}}
  {{#set contextText = searchResults | map('content') | join(' ')}}
  "context": {{extractSources(searchResults)}},
  "response": "{{generateResponse(contextText, userQuestion)}}",
  "timestamp": "{{getCurrentTime()}}"
}`;

const ragJb = new JSONBlade({ useBuiltins: true });
const ragResult = await ragJb.compileAsync(
  ragTemplate,
  { userQuestion: "How does machine learning work?" },
  ragFunctions
);
```

### Multi-Agent Systems

```typescript
const agentFunctions: TemplateFunction[] = [
  {
    name: "routeQuery",
    func: (query: string) => {
      // Implement routing logic
      if (query.includes("math") || query.includes("calculate")) {
        return "math-agent";
      } else if (query.includes("code") || query.includes("programming")) {
        return "code-agent";
      }
      return "general-agent";
    },
  },
  {
    name: "processWithAgent",
    func: async (query: string, agent: string) => {
      // Route to appropriate agent
      const agents = {
        "math-agent": mathAgent,
        "code-agent": codeAgent,
        "general-agent": generalAgent,
      };
      return await agents[agent].process(query);
    },
  },
  {
    name: "getAgentCapabilities",
    func: (agentName: string) => {
      const capabilities = {
        "math-agent": ["arithmetic", "algebra", "statistics"],
        "code-agent": ["javascript", "python", "debugging"],
        "general-agent": ["conversation", "knowledge", "reasoning"],
      };
      return capabilities[agentName] || [];
    },
  },
];

const multiAgentTemplate = `{
  {{#set assignedAgent = routeQuery(userQuery)}}
  "routing": {
    "query": "{{userQuery}}",
    "assignedAgent": "{{assignedAgent}}",
    "capabilities": {{getAgentCapabilities(assignedAgent)}}
  },
  "response": "{{processWithAgent(userQuery, assignedAgent)}}",
  "metadata": {
    "processedAt": "{{getCurrentTime()}}",
    "agent": "{{assignedAgent}}"
  }
}`;
```

### API Integration & External Services

```typescript
const apiFunctions: TemplateFunction[] = [
  {
    name: "callAPI",
    func: async (endpoint: string, data: any) => {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
];

const apiTemplate = `{
  "request": {
    "query": "{{userQuery}}"
  },
  {{#set apiResponse = callAPI(apiEndpoint, requestData)}}
  "response": {{apiResponse}},
  "summary": "{{apiResponse.status | default('failed')}}"
}`;
```

### Content Generation & Personalization

```typescript
const contentFunctions: TemplateFunction[] = [
  {
    name: "personalizeContent",
    func: async (template: string, userProfile: any) => {
      // Implement personalization logic
      return await llm.personalize(template, userProfile);
    },
  },
  {
    name: "detectLanguage",
    func: (text: string) => {
      // Simple language detection
      if (/[àâäéèêëïîôùûüÿç]/.test(text)) return "fr";
      if (/[áéíóúñü]/.test(text)) return "es";
      return "en";
    },
  },
  {
    name: "translateText",
    func: async (text: string, targetLang: string) => {
      // Implement translation
      return await translator.translate(text, targetLang);
    },
  },
];

const contentTemplate = `{
  {{#set userLang = detectLanguage(userQuery)}}
  {{#set needsTranslation = userLang | equals('en') | not}}
  
  "user": {
    "query": "{{userQuery}}",
    "detectedLanguage": "{{userLang}}",
    "needsTranslation": {{needsTranslation}}
  },
  
  {{#if needsTranslation}}
  {{#set translatedQuery = translateText(userQuery, 'en')}}
  "translation": {
    "original": "{{userQuery}}",
    "translated": "{{translatedQuery}}"
  },
  {{#set processedContent = personalizeContent(translatedQuery, userProfile)}}
  {{#set finalContent = translateText(processedContent, userLang)}}
  {{#else}}
  {{#set finalContent = personalizeContent(userQuery, userProfile)}}
  {{/if}}
  
  "content": "{{finalContent}}",
  "metadata": {
    "personalized": true,
    "originalLanguage": "{{userLang}}",
    "processedAt": "{{getCurrentTime()}}"
  }
}`;
```

### LLM Chain Operations

```typescript
const chainFunctions: TemplateFunction[] = [
  {
    name: "extractEntities",
    func: async (text: string) => {
      // Named Entity Recognition
      return await nlpService.extractEntities(text);
    },
  },
  {
    name: "analyzeSentiment",
    func: async (text: string) => {
      // Sentiment analysis
      return await nlpService.analyzeSentiment(text);
    },
  },
  {
    name: "generateSummary",
    func: async (text: string, maxLength: number = 100) => {
      // Text summarization
      return await llm.summarize(text, maxLength);
    },
  },
  {
    name: "classifyIntent",
    func: async (text: string) => {
      // Intent classification
      return await intentClassifier.predict(text);
    },
  },
];

const chainTemplate = `{
  "input": "{{userInput}}",
  
  {{#set entities = extractEntities(userInput)}}
  {{#set sentiment = analyzeSentiment(userInput)}}
  {{#set intent = classifyIntent(userInput)}}
  {{#set summary = generateSummary(userInput)}}
  
  "analysis": {
    "entities": {{entities}},
    "sentiment": {
      "score": {{sentiment.score}},
      "label": "{{sentiment.label}}"
    },
    "intent": {
      "category": "{{intent.category}}",
      "confidence": {{intent.confidence}}
    },
    "summary": "{{summary}}"
  },
  
  "recommendations": [
    {{#if intent.category | equals('question')}}
    "Provide detailed answer",
    "Ask follow-up questions"
    {{#elseif intent.category | equals('request')}}
    "Process the request",
    "Confirm action"
    {{#else}}
    "Continue conversation",
    "Offer assistance"
    {{/if}}
  ],
  
  "metadata": {
    "processingTime": "{{getCurrentTime()}}",
    "confidence": {{intent.confidence}}
  }
}`;
```

## Tips for LLM Developers

### 1. Function Organization

Organize your functions by domain:

```typescript
// Authentication & Security
const authFunctions: TemplateFunction[] = [
  { name: "validateToken", func: validateJWT },
  { name: "getUserRole", func: getRoleFromToken },
];

// LLM Operations
const llmFunctions: TemplateFunction[] = [
  { name: "generateText", func: callLLM },
  { name: "embedText", func: createEmbedding },
];

// Data Processing
const dataFunctions: TemplateFunction[] = [
  { name: "sanitize", func: sanitizeInput },
  { name: "normalize", func: normalizeData },
];

// Combine for specific use cases
const allFunctions = [...authFunctions, ...llmFunctions, ...dataFunctions];
```

### 2. Error Handling & Fallbacks

```typescript
const safeFunctions: TemplateFunction[] = [
  {
    name: "safeCall",
    func: async (operation: string, ...args: any[]) => {
      try {
        return await operations[operation](...args);
      } catch (error) {
        console.error(`Operation ${operation} failed:`, error);
        return { error: true, message: "Operation failed" };
      }
    },
  },
];

const template = `{
  "result": {{safeCall('complexOperation', param1, param2)}},
  "fallback": "{{result.error | bool | if('Operation completed', 'Operation failed')}}"
}`;
```

### 3. Performance Optimization

```typescript
const optimizedFunctions: TemplateFunction[] = [
  {
    name: "memoize",
    func: (() => {
      const cache = new Map();
      return (key: string, operation: Function) => {
        if (cache.has(key)) return cache.get(key);
        const result = operation();
        cache.set(key, result);
        return result;
      };
    })(),
  },
];
```

### 4. Development Best Practices

1. **Start Simple**: Begin with basic string interpolation, then add custom functions
2. **Define Specific Functions**: Create functions tailored to your LLM use case
3. **Type Everything**: Use TypeScript for better development experience
4. **Test Thoroughly**: Test with various data inputs and edge cases
5. **Monitor Performance**: Track template compilation and function execution times
6. **Secure by Design**: Validate all inputs and sanitize outputs
7. **Document Functions**: Clear documentation for each custom function

JSONBlade provides the flexibility to create sophisticated LLM applications while maintaining clean, readable templates and complete control over functionality. The absence of hardcoded functions ensures you build exactly what you need without security concerns or unexpected behavior.
